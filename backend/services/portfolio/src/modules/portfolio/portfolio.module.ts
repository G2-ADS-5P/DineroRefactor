import { Module } from "@nestjs/common";
import { AssetService } from "@portfolio/application/services/asset.service";
import { PortfolioService } from "@portfolio/application/services/portfolio.service";
import {
  ASSET_QUOTATION_SERVICE,
  ASSET_REPOSITORY,
} from "@portfolio/domain/repositories/asset-repository.interface";
import { PORTFOLIO_ASSET_REPOSITORY } from "@portfolio/domain/repositories/portfolio-asset-repository.interface";
import { PORTFOLIO_TRANSACTION_REPOSITORY } from "@portfolio/domain/repositories/portfolio-transaction-repository.interface";
import { AssetsController } from "@portfolio/infra/controllers/assets.controller";
import { HealthController } from "@portfolio/infra/controllers/health.controller";
import { PortfolioController } from "@portfolio/infra/controllers/portfolio.controller";
import { DrizzleAssetRepository } from "@portfolio/infra/repositories/drizzle-asset.repository";
import { DrizzlePortfolioAssetRepository } from "@portfolio/infra/repositories/drizzle-portfolio-asset.repository";
import { DrizzlePortfolioTransactionRepository } from "@portfolio/infra/repositories/drizzle-portfolio-transaction.repository";
import { BrapiQuotationService } from "@portfolio/infra/services/brapi-quotation.service";

@Module({
  controllers: [AssetsController, PortfolioController, HealthController],
  providers: [
    AssetService,
    PortfolioService,
    DrizzleAssetRepository,
    DrizzlePortfolioAssetRepository,
    DrizzlePortfolioTransactionRepository,
    BrapiQuotationService,
    {
      provide: ASSET_REPOSITORY,
      useExisting: DrizzleAssetRepository,
    },
    {
      provide: PORTFOLIO_ASSET_REPOSITORY,
      useExisting: DrizzlePortfolioAssetRepository,
    },
    {
      provide: PORTFOLIO_TRANSACTION_REPOSITORY,
      useExisting: DrizzlePortfolioTransactionRepository,
    },
    {
      provide: ASSET_QUOTATION_SERVICE,
      useExisting: BrapiQuotationService,
    },
  ],
})
export class PortfolioModule {}
