import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from "@nestjs/common";
import type { SubscriptionEventDto } from "@portfolio/application/dto/subscription-event.dto";
import { PortfolioAccessService } from "@portfolio/application/services/portfolio-access.service";
import {
  SubscriptionExchangeName,
  SubscriptionRoutingKey,
} from "@shared/contracts/events/subscription-events.enum";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import type { ConfirmChannel } from "amqplib";
import { randomUUID } from "node:crypto";

const EXCHANGE_TYPE = "direct";

const QUEUES = {
  trialStarted: "portfolio.identity-subscription.trial-started.queue",
  planActivated: "portfolio.identity-subscription.plan-activated.queue",
  planCanceled: "portfolio.identity-subscription.plan-canceled.queue",
  planExpired: "portfolio.identity-subscription.plan-expired.queue",
} as const;

const DEAD_LETTER = {
  exchange: "portfolio.identity-subscription.errors.exchange",
  queue: "portfolio.identity-subscription.errors.queue",
  routingKey: "portfolio.identity-subscription.error",
} as const;

@Injectable()
export class PortfolioSubscriptionConsumerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(
    PortfolioSubscriptionConsumerService.name,
  );
  private channel?: ConfirmChannel;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly portfolioAccessService: PortfolioAccessService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.channel = await this.rabbitMQService.createConfirmChannel();
    await this.registerDeadLetterQueue();

    await Promise.all([
      this.registerConsumer({
        queueName: QUEUES.trialStarted,
        exchangeName: SubscriptionExchangeName.TRIAL_STARTED,
        routingKey: SubscriptionRoutingKey.TRIAL_STARTED,
      }),
      this.registerConsumer({
        queueName: QUEUES.planActivated,
        exchangeName: SubscriptionExchangeName.PLAN_ACTIVATED,
        routingKey: SubscriptionRoutingKey.PLAN_ACTIVATED,
      }),
      this.registerConsumer({
        queueName: QUEUES.planCanceled,
        exchangeName: SubscriptionExchangeName.PLAN_CANCELED,
        routingKey: SubscriptionRoutingKey.PLAN_CANCELED,
      }),
      this.registerConsumer({
        queueName: QUEUES.planExpired,
        exchangeName: SubscriptionExchangeName.PLAN_EXPIRED,
        routingKey: SubscriptionRoutingKey.PLAN_EXPIRED,
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

      const correlationId = msg.properties.correlationId || randomUUID();

      try {
        const payload = JSON.parse(
          msg.content.toString(),
        ) as SubscriptionEventDto;
        await this.portfolioAccessService.syncFromSubscriptionEvent(payload);
        this.channel.ack(msg);
        this.logger.log(
          JSON.stringify({
            event: "subscription_message_consumed",
            queue: params.queueName,
            exchange: params.exchangeName,
            routingKey: params.routingKey,
            correlationId,
            userId: payload.userId,
          }),
        );
      } catch (error) {
        await this.publishToDeadLetterQueue({
          queueName: params.queueName,
          exchangeName: params.exchangeName,
          routingKey: params.routingKey,
          correlationId,
          payload: msg.content.toString(),
          error,
        });
        this.channel.ack(msg);
        this.logger.error(
          JSON.stringify({
            event: "subscription_message_sent_to_dlq",
            queue: params.queueName,
            exchange: params.exchangeName,
            routingKey: params.routingKey,
            correlationId,
            error: this.errorMessage(error),
          }),
        );
      }
    });

    this.logger.log(`Consumer registered on queue "${params.queueName}"`);
  }

  private async registerDeadLetterQueue(): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ consumer channel not initialized");
    }

    await this.channel.assertExchange(DEAD_LETTER.exchange, EXCHANGE_TYPE, {
      durable: true,
    });
    await this.channel.assertQueue(DEAD_LETTER.queue, { durable: true });
    await this.channel.bindQueue(
      DEAD_LETTER.queue,
      DEAD_LETTER.exchange,
      DEAD_LETTER.routingKey,
    );
  }

  private async publishToDeadLetterQueue(params: {
    queueName: string;
    exchangeName: string;
    routingKey: string;
    correlationId: string;
    payload: string;
    error: unknown;
  }): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ consumer channel not initialized");
    }

    const deadLetterPayload = {
      failedAt: new Date().toISOString(),
      source: {
        queue: params.queueName,
        exchange: params.exchangeName,
        routingKey: params.routingKey,
      },
      correlationId: params.correlationId,
      error: this.errorMessage(params.error),
      payload: params.payload,
    };

    this.channel.publish(
      DEAD_LETTER.exchange,
      DEAD_LETTER.routingKey,
      Buffer.from(JSON.stringify(deadLetterPayload)),
      {
        persistent: true,
        contentType: "application/json",
        correlationId: params.correlationId,
      },
    );
    await this.channel.waitForConfirms();
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
