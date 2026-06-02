import { accountsSchema } from "@openfinance/infra/database/schemas/account.schema";
import { pgEnum, pgTable, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("bank_transaction_type", [
  "debit",
  "credit",
]);

export const bankStatementTransactionsSchema = pgTable("bank_statement_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accountsSchema.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  category: text("category"),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
