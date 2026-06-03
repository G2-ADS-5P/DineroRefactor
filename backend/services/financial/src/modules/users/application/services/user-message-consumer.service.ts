import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from "@nestjs/common";
import {
  IdentityExchangeName,
  IdentityRoutingKey,
} from "@shared/contracts/events/identity-events.enum";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import type { UserEventDto } from "@users/application/dto/user-event.dto";
import { UserService } from "@users/application/services/user.service";
import type { Channel } from "amqplib";

const EXCHANGE_TYPE = "direct";

// Uma queue por routing key (created/updated/deleted) em vez de uma queue
// única bound aos 3 exchanges. Permite DLQ e métricas independentes por
// tipo de evento, e isola falhas de handler.
const QUEUES = {
  userCreated: "financial.identity-users.created.queue",
  userUpdated: "financial.identity-users.updated.queue",
  userDeleted: "financial.identity-users.deleted.queue",
} as const;

@Injectable()
export class UserMessageConsumerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(UserMessageConsumerService.name);
  private channel?: Channel;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly userService: UserService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.channel = await this.rabbitMQService.createChannel();

    await Promise.all([
      this.registerConsumer({
        queueName: QUEUES.userCreated,
        exchangeName: IdentityExchangeName.USER_CREATED,
        routingKey: IdentityRoutingKey.USER_CREATED,
        handler: (payload) =>
          this.userService.upsertFromIdentity(payload as UserEventDto),
      }),
      this.registerConsumer({
        queueName: QUEUES.userUpdated,
        exchangeName: IdentityExchangeName.USER_UPDATED,
        routingKey: IdentityRoutingKey.USER_UPDATED,
        handler: (payload) =>
          this.userService.upsertFromIdentity(payload as UserEventDto),
      }),
      this.registerConsumer({
        queueName: QUEUES.userDeleted,
        exchangeName: IdentityExchangeName.USER_DELETED,
        routingKey: IdentityRoutingKey.USER_DELETED,
        handler: (payload) =>
          this.userService.removeByExternalId((payload as UserEventDto).id),
      }),
    ]);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
  }

  private async registerConsumer(params: {
    queueName: string;
    exchangeName: string;
    routingKey: string;
    handler: (payload: unknown) => Promise<void>;
  }): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ consumer channel not initialized");
    }

    await this.channel.assertExchange(params.exchangeName, EXCHANGE_TYPE, {
      durable: true,
    });
    await this.channel.assertQueue(params.queueName, { durable: true });
    await this.channel.bindQueue(
      params.queueName,
      params.exchangeName,
      params.routingKey,
    );

    await this.channel.consume(params.queueName, async (msg) => {
      if (!msg || !this.channel) return;

      try {
        const payload = JSON.parse(msg.content.toString()) as unknown;
        await params.handler(payload);
        this.channel.ack(msg);
        this.logger.log(`Message consumed from queue "${params.queueName}"`);
      } catch (error) {
        this.logger.error(
          `Failed to process message from queue "${params.queueName}"`,
          error,
        );
        this.channel.nack(msg, false, false);
      }
    });

    this.logger.log(`Consumer registered on queue "${params.queueName}"`);
  }
}
