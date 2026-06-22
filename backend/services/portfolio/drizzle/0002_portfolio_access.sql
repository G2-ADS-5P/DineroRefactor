CREATE TYPE "public"."portfolio_access_plan" AS ENUM('TRIAL', 'FREE', 'PRO');--> statement-breakpoint
CREATE TYPE "public"."portfolio_access_status" AS ENUM('ACTIVE', 'EXPIRED', 'CANCELED');--> statement-breakpoint
CREATE TABLE "portfolio_user_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "portfolio_access_plan" NOT NULL,
	"status" "portfolio_access_status" NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"plan_expires_at" timestamp with time zone,
	"last_event_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "portfolio_user_access_user_id_unique" UNIQUE("user_id")
);
