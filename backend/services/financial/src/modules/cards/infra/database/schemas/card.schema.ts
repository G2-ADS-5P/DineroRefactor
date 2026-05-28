import { usersSchema } from "@users/infra/database/schemas/user.schema";
import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const cardsSchema = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  lastDigits: varchar("last_digits", { length: 4 }).notNull(),
  currentBill: numeric("current_bill", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),
  creditLimit: numeric("credit_limit", { precision: 15, scale: 2 }).notNull(),
  dueDay: integer("due_day").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
