import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const enrollmentClassOfferingStatusValues = [
  "active",
  "inactive",
] as const;

export type EnrollmentClassOfferingStatus =
  (typeof enrollmentClassOfferingStatusValues)[number];

export const classOfferingStatusEnum = pgEnum("class_offering_status", [
  "active",
  "inactive",
]);

export const classOfferingsSchema = pgTable("class_offerings", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: uuid("external_id").notNull().unique(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: classOfferingStatusEnum("status").notNull(),
});
