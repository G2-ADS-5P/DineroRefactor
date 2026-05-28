import type { PortfolioTransaction } from "@portfolio/domain/models/portfolio-transaction.entity";

export const PORTFOLIO_TRANSACTION_REPOSITORY = Symbol(
  "PORTFOLIO_TRANSACTION_REPOSITORY",
);

export interface PortfolioTransactionRepository {
  create(transaction: PortfolioTransaction): Promise<PortfolioTransaction>;
  findAllByUserId(userId: string): Promise<PortfolioTransaction[]>;
}
