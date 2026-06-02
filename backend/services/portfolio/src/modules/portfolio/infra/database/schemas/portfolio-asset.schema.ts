import { assetsSchema } from "@portfolio/infra/database/schemas/asset.schema";
import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const portfolioAssetsSchema = pgTable(
  "portfolio_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assetsSchema.id),
    quantity: integer("quantity").notNull(),
    averagePrice: numeric("average_price", {
      precision: 15,
      scale: 2,
      mode: "number",
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("portfolio_assets_user_id_asset_id_key").on(
      table.userId,
      table.assetId,
    ),
  ],
);
