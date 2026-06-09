import type { Subscription } from "@subscriptions/domain/models/subscription.entity";

export const SUBSCRIPTION_REPOSITORY = Symbol("SUBSCRIPTION_REPOSITORY");

export interface SubscriptionRepository {
  create(subscription: Subscription): Promise<void>;
  update(subscription: Subscription): Promise<void>;
  findByUserId(userId: string): Promise<Subscription | null>;
  findAllExpiredTrials(now: Date): Promise<Subscription[]>;
}
