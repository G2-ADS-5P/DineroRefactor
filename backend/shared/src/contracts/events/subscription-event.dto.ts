export interface SubscriptionEventDto {
  userId: string;
  plan: "TRIAL" | "FREE" | "PRO";
  status: "ACTIVE" | "EXPIRED" | "CANCELED";
  trialEndsAt: string | null;
  planExpiresAt: string | null;
  occurredAt: string;
}
