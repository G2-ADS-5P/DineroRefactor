import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AssetService } from "@portfolio/application/services/asset.service";
import { PortfolioService } from "@portfolio/application/services/portfolio.service";
import { PortfolioAccessService } from "@portfolio/application/services/portfolio-access.service";
import { PortfolioSubscriptionConsumerService } from "@portfolio/application/services/portfolio-subscription-consumer.service";
import {
  ASSET_QUOTATION_SERVICE,
  ASSET_REPOSITORY,
} from "@portfolio/domain/repositories/asset-repository.interface";
import { PORTFOLIO_ACCESS_REPOSITORY } from "@portfolio/domain/repositories/portfolio-access-repository.interface";
import { PORTFOLIO_ASSET_REPOSITORY } from "@portfolio/domain/repositories/portfolio-asset-repository.interface";
import { PORTFOLIO_TRANSACTION_REPOSITORY } from "@portfolio/domain/repositories/portfolio-transaction-repository.interface";
import { AssetsController } from "@portfolio/infra/controllers/assets.controller";
import { HealthController } from "@portfolio/infra/controllers/health.controller";
import { PortfolioController } from "@portfolio/infra/controllers/portfolio.controller";
import { PortfolioWriteAccessGuard } from "@portfolio/infra/guards/portfolio-write-access.guard";
import { PortfolioExceptionFilter } from "@portfolio/infra/http/portfolio-exception.filter";
import { DrizzleAssetRepository } from "@portfolio/infra/repositories/drizzle-asset.repository";
import { DrizzlePortfolioAccessRepository } from "@portfolio/infra/repositories/drizzle-portfolio-access.repository";
import { DrizzlePortfolioAssetRepository } from "@portfolio/infra/repositories/drizzle-portfolio-asset.repository";
import { DrizzlePortfolioTransactionRepository } from "@portfolio/infra/repositories/drizzle-portfolio-transaction.repository";
import { BrapiQuotationService } from "@portfolio/infra/services/brapi-quotation.service";

@Module({
  controllers: [AssetsController, PortfolioController, HealthController],
  providers: [
    AssetService,
    PortfolioAccessService,
    PortfolioSubscriptionConsumerService,
    PortfolioService,
    PortfolioWriteAccessGuard,
    DrizzleAssetRepository,
    DrizzlePortfolioAccessRepository,
    DrizzlePortfolioAssetRepository,
    DrizzlePortfolioTransactionRepository,
    BrapiQuotationService,
    {
      provide: APP_FILTER,
      useClass: PortfolioExceptionFilter,
    },
    {
      provide: ASSET_REPOSITORY,
      useExisting: DrizzleAssetRepository,
    },
    {
      provide: PORTFOLIO_ACCESS_REPOSITORY,
      useExisting: DrizzlePortfolioAccessRepository,
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
