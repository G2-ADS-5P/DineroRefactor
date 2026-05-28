import { usersSchema } from "@users/infra/database/schemas/user.schema";
import {
  type AnyPgColumn,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categoriesSchema = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  parentId: uuid("parent_id").references(
    (): AnyPgColumn => categoriesSchema.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
