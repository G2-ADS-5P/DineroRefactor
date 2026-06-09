SELECT 'CREATE DATABASE dinero_identity'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'dinero_identity'
)\gexec

SELECT 'CREATE DATABASE dinero_financial'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'dinero_financial'
)\gexec

SELECT 'CREATE DATABASE dinero_portfolio'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'dinero_portfolio'
)\gexec

SELECT 'CREATE DATABASE dinero_openfinance'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'dinero_openfinance'
)\gexec
