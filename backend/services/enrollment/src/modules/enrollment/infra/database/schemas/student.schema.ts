import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const studentsSchema = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: uuid("external_id").notNull().unique(),
  name: text("name").notNull(),
});
