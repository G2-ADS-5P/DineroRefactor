CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent');--> statement-breakpoint
CREATE TYPE "public"."class_offering_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'canceled');--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"class_offering_id" uuid NOT NULL,
	"status" "attendance_status" NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" uuid NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" "class_offering_status" NOT NULL,
	CONSTRAINT "class_offerings_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"class_offering_id" uuid NOT NULL,
	"status" "enrollment_status" NOT NULL,
	CONSTRAINT "enrollments_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" uuid NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "lessons_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" uuid NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "students_external_id_unique" UNIQUE("external_id")
);
