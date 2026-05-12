import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export type AttendanceClassOfferingStatus = "active" | "inactive";

export const attendanceClassOfferingStatusEnum = pgEnum(
  "class_offering_status",
  ["active", "inactive"],
);

export const classOfferingsSchema = pgTable("class_offerings", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: uuid("external_id").notNull().unique(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: attendanceClassOfferingStatusEnum("status").notNull(),
});
