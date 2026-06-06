import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { SubscriptionEventDto } from "@subscriptions/application/dto/subscription-event.dto";
import { SubscriptionMessagingService } from "@subscriptions/application/services/subscription-messaging.service";
import { Subscription } from "@subscriptions/domain/models/subscription.entity";
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from "@subscriptions/domain/repositories/subscription-repository.interface";

const TRIAL_DAYS = 14;

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionMessagingService: SubscriptionMessagingService,
  ) {}

  async startTrial(userId: string): Promise<Subscription> {
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    const subscription = Subscription.restore({
      userId,
      plan: "TRIAL",
      status: "ACTIVE",
      trialEndsAt,
    })!;

    await this.subscriptionRepository.create(subscription);
    const created = await this.subscriptionRepository.findByUserId(userId);

    await this.subscriptionMessagingService.publishTrialStarted(
      this.toEventDto(created!),
    );

    return created!;
  }

  async activatePlan(
    userId: string,
    durationDays = 30,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) throw new NotFoundException("Subscription not found");

    const planExpiresAt = new Date();
    planExpiresAt.setDate(planExpiresAt.getDate() + durationDays);

    subscription.withPlan("PRO").withStatus("ACTIVE").withPlanExpiresAt(planExpiresAt);

    await this.subscriptionRepository.update(subscription);
    const updated = await this.subscriptionRepository.findByUserId(userId);

    await this.subscriptionMessagingService.publishPlanActivated(
      this.toEventDto(updated!),
    );

    return updated!;
  }

  async cancelPlan(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) throw new NotFoundException("Subscription not found");

    subscription.withStatus("CANCELED");

    await this.subscriptionRepository.update(subscription);
    const updated = await this.subscriptionRepository.findByUserId(userId);

    await this.subscriptionMessagingService.publishPlanCanceled(
      this.toEventDto(updated!),
    );

    return updated!;
  }

  async expireOldTrials(): Promise<void> {
    const now = new Date();
    const expired = await this.subscriptionRepository.findAllExpiredTrials(now);

    await Promise.all(
      expired.map(async (subscription) => {
        subscription.markExpired();
        await this.subscriptionRepository.update(subscription);
        await this.subscriptionMessagingService.publishPlanExpired(
          this.toEventDto(subscription),
        );
      }),
    );
  }

  async findByUserId(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) throw new NotFoundException("Subscription not found");
    return subscription;
  }

  private toEventDto(subscription: Subscription): SubscriptionEventDto {
    return {
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
      planExpiresAt: subscription.planExpiresAt?.toISOString() ?? null,
      occurredAt: new Date().toISOString(),
    };
  }
}
