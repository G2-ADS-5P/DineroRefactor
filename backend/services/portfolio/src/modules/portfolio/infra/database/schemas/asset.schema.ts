import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const assetsSchema = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
