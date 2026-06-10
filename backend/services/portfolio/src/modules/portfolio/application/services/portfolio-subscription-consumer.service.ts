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
import type { Channel } from "amqplib";

const EXCHANGE_TYPE = "direct";

const QUEUES = {
  trialStarted: "portfolio.identity-subscription.trial-started.queue",
  planActivated: "portfolio.identity-subscription.plan-activated.queue",
  planCanceled: "portfolio.identity-subscription.plan-canceled.queue",
  planExpired: "portfolio.identity-subscription.plan-expired.queue",
} as const;

@Injectable()
export class PortfolioSubscriptionConsumerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(
    PortfolioSubscriptionConsumerService.name,
  );
  private channel?: Channel;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly portfolioAccessService: PortfolioAccessService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.channel = await this.rabbitMQService.createChannel();

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

      try {
        const payload = JSON.parse(
          msg.content.toString(),
        ) as SubscriptionEventDto;
        await this.portfolioAccessService.syncFromSubscriptionEvent(payload);
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
