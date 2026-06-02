CREATE TABLE "portfolio_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"type" varchar(10) NOT NULL,
	"operation_date" timestamp with time zone NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"costs" numeric(15, 2) NOT NULL,
	"total_value" numeric(15, 2) NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "assets" ("ticker", "name", "type", "created_at")
VALUES
  ('PETR4', 'Petrobras PN', 'ACAO', NOW()),
  ('VALE3', 'Vale ON', 'ACAO', NOW()),
  ('ITUB4', 'Itau Unibanco PN', 'ACAO', NOW()),
  ('WEGE3', 'WEG ON', 'ACAO', NOW()),
  ('MXRF11', 'Maxi Renda FII', 'FII', NOW()),
  ('HGLG11', 'CSHG Logistica', 'FII', NOW()),
  ('XPML11', 'XP Malls FII', 'FII', NOW()),
  ('AAPL34', 'Apple BDR', 'BDR', NOW()),
  ('MSFT34', 'Microsoft BDR', 'BDR', NOW()),
  ('IVVB11', 'iShares S&P 500', 'ETF', NOW()),
  ('BOVA11', 'iShares Ibovespa', 'ETF', NOW()),
  ('BTC', 'Bitcoin', 'CRIPTO', NOW()),
  ('ETH', 'Ethereum', 'CRIPTO', NOW())
ON CONFLICT ("ticker") DO NOTHING;
