SELECT 'CREATE DATABASE school_academic'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'school_academic'
)\gexec

SELECT 'CREATE DATABASE school_class_offering'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'school_class_offering'
)\gexec

SELECT 'CREATE DATABASE school_enrollment'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'school_enrollment'
)\gexec

SELECT 'CREATE DATABASE school_attendance'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'school_attendance'
)\gexec

SELECT 'CREATE DATABASE school_user_auth'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'school_user_auth'
)\gexec

SELECT 'CREATE DATABASE dinero_portfolio'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'dinero_portfolio'
)\gexec

SELECT 'CREATE DATABASE dinero_identity'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'dinero_identity'
)\gexec
