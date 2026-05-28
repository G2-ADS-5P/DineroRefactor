import { cardsSchema } from "@cards/infra/database/schemas/card.schema";
import { categoriesSchema } from "@categories/infra/database/schemas/category.schema";
import { usersSchema } from "@users/infra/database/schemas/user.schema";
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const transactionsSchema = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    cardId: uuid("card_id").references(() => cardsSchema.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id").references(() => categoriesSchema.id, {
      onDelete: "set null",
    }),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("BRL"),
    amountBrl: numeric("amount_brl", { precision: 15, scale: 2 }),
    exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }),
    type: text("type").notNull(),
    description: text("description").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    isRecurring: boolean("is_recurring").notNull().default(false),
    recurringRule: text("recurring_rule"),
    notes: text("notes"),
    tags: text("tags").array(),
    clientUuid: text("client_uuid"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("transactions_user_id_client_uuid_unique").on(
      table.userId,
      table.clientUuid,
    ),
  ],
);
