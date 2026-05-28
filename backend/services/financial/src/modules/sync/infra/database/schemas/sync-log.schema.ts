import { usersSchema } from "@users/infra/database/schemas/user.schema";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const syncLogsSchema = pgTable("sync_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(),
  status: text("status").notNull(),
  itemsCount: integer("items_count").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
