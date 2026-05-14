import { usersSchema } from "@users/infra/database/schemas/user.schema";
import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const userPreferencesSchema = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  defaultCurrency: text("default_currency").notNull().default("BRL"),
  darkMode: boolean("dark_mode").notNull().default(true),
});
