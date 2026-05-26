import { assetsSchema } from "@portfolio/infra/database/schemas/asset.schema";
import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const portfolioTransactionsSchema = pgTable("portfolio_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assetsSchema.id),
  type: varchar("type", { length: 10 }).notNull(),
  operationDate: timestamp("operation_date", { withTimezone: true }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", {
    precision: 15,
    scale: 2,
    mode: "number",
  }).notNull(),
  costs: numeric("costs", {
    precision: 15,
    scale: 2,
    mode: "number",
  }).notNull(),
  totalValue: numeric("total_value", {
    precision: 15,
    scale: 2,
    mode: "number",
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
