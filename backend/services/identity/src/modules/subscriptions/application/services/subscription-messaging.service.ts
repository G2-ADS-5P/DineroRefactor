import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from "@nestjs/common";
import {
  SubscriptionExchangeName,
  SubscriptionRoutingKey,
} from "@shared/contracts/events/subscription-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import type { SubscriptionEventDto } from "@subscriptions/application/dto/subscription-event.dto";

@Injectable()
export class SubscriptionMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SubscriptionMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          SubscriptionExchangeName.TRIAL_STARTED,
        ),
        this.sharedMessagingService.assertExchange(
          SubscriptionExchangeName.PLAN_ACTIVATED,
        ),
        this.sharedMessagingService.assertExchange(
          SubscriptionExchangeName.PLAN_CANCELED,
        ),
        this.sharedMessagingService.assertExchange(
          SubscriptionExchangeName.PLAN_EXPIRED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert subscription exchanges", error);
      throw error;
    }
  }

  async publishTrialStarted(dto: SubscriptionEventDto): Promise<void> {
    await this.sharedMessagingService.publish(
      SubscriptionExchangeName.TRIAL_STARTED,
      SubscriptionRoutingKey.TRIAL_STARTED,
      dto,
    );
  }

  async publishPlanActivated(dto: SubscriptionEventDto): Promise<void> {
    await this.sharedMessagingService.publish(
      SubscriptionExchangeName.PLAN_ACTIVATED,
      SubscriptionRoutingKey.PLAN_ACTIVATED,
      dto,
    );
  }

  async publishPlanCanceled(dto: SubscriptionEventDto): Promise<void> {
    await this.sharedMessagingService.publish(
      SubscriptionExchangeName.PLAN_CANCELED,
      SubscriptionRoutingKey.PLAN_CANCELED,
      dto,
    );
  }

  async publishPlanExpired(dto: SubscriptionEventDto): Promise<void> {
    await this.sharedMessagingService.publish(
      SubscriptionExchangeName.PLAN_EXPIRED,
      SubscriptionRoutingKey.PLAN_EXPIRED,
      dto,
    );
  }
}
