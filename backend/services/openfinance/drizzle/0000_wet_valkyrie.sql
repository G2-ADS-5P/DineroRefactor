CREATE TYPE "public"."account_type" AS ENUM('checking', 'savings');--> statement-breakpoint
CREATE TYPE "public"."bank_connection_status" AS ENUM('pending_consent', 'active', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."bank_transaction_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."card_brand" AS ENUM('Visa', 'Mastercard', 'Elo', 'Hipercard');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_connection_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"account_type" "account_type" NOT NULL,
	"account_number" text NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bank_name" text NOT NULL,
	"consent_id" text NOT NULL,
	"pluggy_item_id" text,
	"status" "bank_connection_status" DEFAULT 'pending_consent' NOT NULL,
	"connected_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "bank_connections_consent_id_unique" UNIQUE("consent_id")
);
--> statement-breakpoint
CREATE TABLE "bank_statement_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"type" "bank_transaction_type" NOT NULL,
	"category" text,
	"transaction_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_connection_id" uuid NOT NULL,
	"last_four_digits" text NOT NULL,
	"card_brand" "card_brand" NOT NULL,
	"card_limit" numeric(15, 2) NOT NULL,
	"available_limit" numeric(15, 2) NOT NULL,
	"current_bill" numeric(15, 2) DEFAULT '0' NOT NULL,
	"due_day" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_bank_connection_id_bank_connections_id_fk" FOREIGN KEY ("bank_connection_id") REFERENCES "public"."bank_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_statement_transactions" ADD CONSTRAINT "bank_statement_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_bank_connection_id_bank_connections_id_fk" FOREIGN KEY ("bank_connection_id") REFERENCES "public"."bank_connections"("id") ON DELETE cascade ON UPDATE no action;