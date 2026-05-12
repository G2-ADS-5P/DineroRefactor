CREATE TYPE "public"."class_offering_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'canceled');--> statement-breakpoint
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
	"student_id" uuid NOT NULL,
	"class_offering_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp with time zone NOT NULL,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" uuid NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "students_external_id_unique" UNIQUE("external_id")
);
