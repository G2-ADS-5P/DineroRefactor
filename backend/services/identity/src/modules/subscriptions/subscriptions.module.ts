import { Module } from "@nestjs/common";
import { SubscriptionMessagingService } from "@subscriptions/application/services/subscription-messaging.service";
import { SubscriptionService } from "@subscriptions/application/services/subscription.service";
import { SUBSCRIPTION_REPOSITORY } from "@subscriptions/domain/repositories/subscription-repository.interface";
import { SubscriptionsController } from "@subscriptions/infra/controllers/subscriptions.controller";
import { DrizzleSubscriptionRepository } from "@subscriptions/infra/repositories/drizzle-subscription.repository";

@Module({
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionService,
    SubscriptionMessagingService,
    DrizzleSubscriptionRepository,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useExisting: DrizzleSubscriptionRepository,
    },
  ],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
