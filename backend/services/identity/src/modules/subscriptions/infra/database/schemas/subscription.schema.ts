import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersSchema } from "@users/infra/database/schemas/user.schema";

export const planEnum = pgEnum("subscription_plan", ["TRIAL", "FREE", "PRO"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "EXPIRED",
  "CANCELED",
]);

export const subscriptionsSchema = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  plan: planEnum("plan").notNull().default("TRIAL"),
  status: subscriptionStatusEnum("status").notNull().default("ACTIVE"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  planExpiresAt: timestamp("plan_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
