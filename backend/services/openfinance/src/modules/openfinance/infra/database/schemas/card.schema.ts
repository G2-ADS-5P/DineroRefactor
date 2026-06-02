import { bankConnectionsSchema } from "@openfinance/infra/database/schemas/bank-connection.schema";
import { pgEnum, pgTable, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core";

export const cardBrandEnum = pgEnum("card_brand", [
  "Visa",
  "Mastercard",
  "Elo",
  "Hipercard",
]);

export const cardsSchema = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankConnectionId: uuid("bank_connection_id")
    .notNull()
    .references(() => bankConnectionsSchema.id, { onDelete: "cascade" }),
  lastFourDigits: text("last_four_digits").notNull(),
  cardBrand: cardBrandEnum("card_brand").notNull(),
  cardLimit: numeric("card_limit", { precision: 15, scale: 2 }).notNull(),
  availableLimit: numeric("available_limit", { precision: 15, scale: 2 }).notNull(),
  currentBill: numeric("current_bill", { precision: 15, scale: 2 }).notNull().default("0"),
  dueDay: text("due_day").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
