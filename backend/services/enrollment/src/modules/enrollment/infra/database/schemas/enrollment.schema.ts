import { classOfferingsSchema } from "@enrollment/infra/database/schemas/class-offering.schema";
import { studentsSchema } from "@enrollment/infra/database/schemas/student.schema";
import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "canceled",
]);

export const enrollmentsSchema = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentsSchema.id),
  classOfferingId: uuid("class_offering_id")
    .notNull()
    .references(() => classOfferingsSchema.id),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull(),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
