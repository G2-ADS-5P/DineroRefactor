import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { Subscription } from "@subscriptions/domain/models/subscription.entity";
import type { SubscriptionRepository } from "@subscriptions/domain/repositories/subscription-repository.interface";
import { subscriptionsSchema } from "@subscriptions/infra/database/schemas/subscription.schema";
import { and, eq, lt } from "drizzle-orm";

@Injectable()
export class DrizzleSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(subscription: Subscription): Promise<void> {
    await this.drizzleService.db.insert(subscriptionsSchema).values({
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      trialEndsAt: subscription.trialEndsAt ?? null,
      planExpiresAt: subscription.planExpiresAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(subscription: Subscription): Promise<void> {
    await this.drizzleService.db
      .update(subscriptionsSchema)
      .set({
        plan: subscription.plan,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt ?? null,
        planExpiresAt: subscription.planExpiresAt ?? null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsSchema.id, subscription.id!));
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const result = await this.drizzleService.db
      .select()
      .from(subscriptionsSchema)
      .where(eq(subscriptionsSchema.userId, userId))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findAllExpiredTrials(now: Date): Promise<Subscription[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(subscriptionsSchema)
      .where(
        and(
          eq(subscriptionsSchema.plan, "TRIAL"),
          eq(subscriptionsSchema.status, "ACTIVE"),
          lt(subscriptionsSchema.trialEndsAt, now),
        ),
      );

    return rows
      .map((row) => this.toEntity(row))
      .filter((s): s is Subscription => s !== null);
  }

  private toEntity(
    row?: typeof subscriptionsSchema.$inferSelect,
  ): Subscription | null {
    if (!row) return null;

    return Subscription.restore({
      id: row.id,
      userId: row.userId,
      plan: row.plan,
      status: row.status,
      trialEndsAt: row.trialEndsAt ?? undefined,
      planExpiresAt: row.planExpiresAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
