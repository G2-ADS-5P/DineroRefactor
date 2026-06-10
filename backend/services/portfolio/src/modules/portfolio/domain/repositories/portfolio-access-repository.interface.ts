import type { PortfolioAccess } from "@portfolio/domain/models/portfolio-access.entity";

export const PORTFOLIO_ACCESS_REPOSITORY = Symbol(
  "PORTFOLIO_ACCESS_REPOSITORY",
);

export interface PortfolioAccessRepository {
  save(access: PortfolioAccess): Promise<PortfolioAccess>;
  findByUserId(userId: string): Promise<PortfolioAccess | null>;
}
