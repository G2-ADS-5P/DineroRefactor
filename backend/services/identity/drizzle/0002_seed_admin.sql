INSERT INTO "users" (
  "id",
  "name",
  "email",
  "password",
  "created_at",
  "updated_at"
)
VALUES (
  gen_random_uuid(),
  'Admin',
  'admin@dinero.app',
  '$2b$10$RmfF90aIavmXxi2lSPUxPejL5jMcjdCWSsgjd2B3JDRy1LS8blcKW', -- bcrypt hash of 'Admin123'
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "password" = EXCLUDED."password",
  "updated_at" = NOW();
--> statement-breakpoint
INSERT INTO "user_preferences" ("user_id", "default_currency", "dark_mode")
SELECT "id", 'BRL', true FROM "users" WHERE "email" = 'admin@dinero.app'
ON CONFLICT ("user_id") DO NOTHING;
