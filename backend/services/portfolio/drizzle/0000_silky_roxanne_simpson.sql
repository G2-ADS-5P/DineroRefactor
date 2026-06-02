CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "assets_ticker_unique" UNIQUE("ticker")
);
--> statement-breakpoint
CREATE TABLE "portfolio_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"average_price" numeric(15, 2) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio_assets" ADD CONSTRAINT "portfolio_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_assets_user_id_asset_id_key" ON "portfolio_assets" USING btree ("user_id","asset_id");