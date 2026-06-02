import type { PortfolioAsset } from "@portfolio/domain/models/portfolio-asset.entity";

export const PORTFOLIO_ASSET_REPOSITORY = Symbol("PORTFOLIO_ASSET_REPOSITORY");

export interface PortfolioAssetRepository {
  save(portfolioAsset: PortfolioAsset): Promise<PortfolioAsset>;
  findById(id: string): Promise<PortfolioAsset | null>;
  findByUserAndAsset(
    userId: string,
    assetId: string,
  ): Promise<PortfolioAsset | null>;
  findAllByUserId(userId: string): Promise<PortfolioAsset[]>;
  delete(id: string): Promise<void>;
}
