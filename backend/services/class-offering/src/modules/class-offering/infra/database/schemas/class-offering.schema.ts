import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { subjectsSchema } from "./subject.schema";
import { teachersSchema } from "./teacher.schema";

export const classOfferingStatusEnum = pgEnum("class_offering_status", [
  "active",
  "inactive",
]);

export const classOfferingsSchema = pgTable("class_offerings", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjectsSchema.id),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachersSchema.id),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: classOfferingStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
