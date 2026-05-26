import { bankConnectionsSchema } from "@openfinance/infra/database/schemas/bank-connection.schema";
import { pgEnum, pgTable, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", ["checking", "savings"]);

export const accountsSchema = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankConnectionId: uuid("bank_connection_id")
    .notNull()
    .references(() => bankConnectionsSchema.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  accountType: accountTypeEnum("account_type").notNull(),
  accountNumber: text("account_number").notNull(),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("BRL"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
