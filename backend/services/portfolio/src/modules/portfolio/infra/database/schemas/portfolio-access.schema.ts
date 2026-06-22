import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const portfolioAccessPlanEnum = pgEnum("portfolio_access_plan", [
  "TRIAL",
  "PRO",
  "FREE",
]);

export const portfolioAccessStatusEnum = pgEnum("portfolio_access_status", [
  "ACTIVE",
  "EXPIRED",
  "CANCELED",
]);

export const portfolioAccessSchema = pgTable("portfolio_user_access", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),
  plan: portfolioAccessPlanEnum("plan").notNull(),
  status: portfolioAccessStatusEnum("status").notNull(),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  planExpiresAt: timestamp("plan_expires_at", { withTimezone: true }),
  lastEventAt: timestamp("last_event_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
