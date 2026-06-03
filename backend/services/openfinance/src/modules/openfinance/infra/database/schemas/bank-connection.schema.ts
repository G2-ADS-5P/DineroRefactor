import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const bankConnectionStatusEnum = pgEnum("bank_connection_status", [
  "pending_consent",
  "active",
  "revoked",
]);

export const bankConnectionsSchema = pgTable("bank_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  bankName: text("bank_name").notNull(),
  consentId: text("consent_id").notNull().unique(),
  pluggyItemId: text("pluggy_item_id"),
  status: bankConnectionStatusEnum("status").notNull().default("pending_consent"),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
