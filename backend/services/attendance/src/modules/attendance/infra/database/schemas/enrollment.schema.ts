import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";

export const attendanceEnrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "canceled",
]);

export type AttendanceEnrollmentStatus = "active" | "canceled";

export const enrollmentsSchema = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: uuid("external_id").notNull().unique(),
  studentId: uuid("student_id").notNull(),
  classOfferingId: uuid("class_offering_id").notNull(),
  status: attendanceEnrollmentStatusEnum("status").notNull(),
});
