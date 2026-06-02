INSERT INTO "users" (
  "email",
  "password",
  "teacher_id",
  "permissions",
  "created_at",
  "updated_at"
)
VALUES (
  'admin@school.com',
  '$2b$10$Y8lgEDKSyBeXbXskPOy80ekkhhjraSUhI39itsBUQKM//QpmNAd6C',
  NULL,
  ARRAY[
    'students:read',
    'students:write',
    'students:delete',
    'teachers:read',
    'teachers:write',
    'teachers:delete',
    'subjects:read',
    'subjects:write',
    'subjects:delete',
    'class-offerings:read',
    'class-offerings:write',
    'class-offerings:delete',
    'enrollments:read',
    'enrollments:write',
    'enrollments:delete',
    'attendances:read',
    'attendances:write',
    'attendances:delete',
    'portfolio:read',
    'portfolio:write',
    'portfolio:delete',
    'users:read',
    'users:write',
    'users:delete'
  ]::text[],
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO UPDATE
SET
  "password" = EXCLUDED."password",
  "teacher_id" = EXCLUDED."teacher_id",
  "permissions" = EXCLUDED."permissions",
  "updated_at" = NOW();
