export enum Permission {
  PORTFOLIO_READ = "portfolio:read",
  PORTFOLIO_WRITE = "portfolio:write",
  PORTFOLIO_DELETE = "portfolio:delete",

  USERS_READ = "users:read",
  USERS_WRITE = "users:write",
  USERS_DELETE = "users:delete",

  TRANSACTIONS_READ = "transactions:read",
  TRANSACTIONS_WRITE = "transactions:write",
  TRANSACTIONS_DELETE = "transactions:delete",

  CARDS_READ = "cards:read",
  CARDS_WRITE = "cards:write",
  CARDS_DELETE = "cards:delete",

  CATEGORIES_READ = "categories:read",
  CATEGORIES_WRITE = "categories:write",
  CATEGORIES_DELETE = "categories:delete",

  BALANCE_READ = "balance:read",

  RECONCILIATION_READ = "reconciliation:read",
  RECONCILIATION_WRITE = "reconciliation:write",

  SYNC_READ = "sync:read",
  SYNC_WRITE = "sync:write",
}
