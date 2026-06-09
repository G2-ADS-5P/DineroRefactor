import { ApiProperty } from "@nestjs/swagger";
import type { Subscription } from "@subscriptions/domain/models/subscription.entity";

export class SubscriptionResponseDto {
  @ApiProperty({ example: "uuid" })
  id: string;

  @ApiProperty({ example: "uuid" })
  userId: string;

  @ApiProperty({ enum: ["TRIAL", "FREE", "PRO"], example: "TRIAL" })
  plan: string;

  @ApiProperty({ enum: ["ACTIVE", "EXPIRED", "CANCELED"], example: "ACTIVE" })
  status: string;

  @ApiProperty({ example: "2026-06-20T00:00:00.000Z", nullable: true })
  trialEndsAt: string | null;

  @ApiProperty({ example: null, nullable: true })
  planExpiresAt: string | null;

  @ApiProperty({ example: "2026-06-06T00:00:00.000Z" })
  createdAt: string;

  constructor(
    id: string,
    userId: string,
    plan: string,
    status: string,
    trialEndsAt: string | null,
    planExpiresAt: string | null,
    createdAt: string,
  ) {
    this.id = id;
    this.userId = userId;
    this.plan = plan;
    this.status = status;
    this.trialEndsAt = trialEndsAt;
    this.planExpiresAt = planExpiresAt;
    this.createdAt = createdAt;
  }

  static from(subscription: Subscription | null): SubscriptionResponseDto | null {
    if (!subscription) return null;
    return new SubscriptionResponseDto(
      subscription.id!,
      subscription.userId,
      subscription.plan,
      subscription.status,
      subscription.trialEndsAt?.toISOString() ?? null,
      subscription.planExpiresAt?.toISOString() ?? null,
      subscription.createdAt?.toISOString() ?? new Date().toISOString(),
    );
  }
}
