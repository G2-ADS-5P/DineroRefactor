import { Inject, Injectable } from "@nestjs/common";
import { AddPortfolioAssetDto } from "@portfolio/application/dto/add-portfolio-asset.dto";
import { CreatePortfolioTransactionDto } from "@portfolio/application/dto/create-portfolio-transaction.dto";
import {
  PortfolioDto,
  PortfolioItemDto,
} from "@portfolio/application/dto/portfolio.dto";
import { PortfolioTransactionDto } from "@portfolio/application/dto/portfolio-transaction.dto";
import { PortfolioTransactionResultDto } from "@portfolio/application/dto/portfolio-transaction-result.dto";
import {
  AssetNotFoundError,
  AssetNotInPortfolioError,
  PortfolioPositionNotFoundError,
} from "@portfolio/domain/errors/portfolio.errors";
import { AssetService } from "@portfolio/application/services/asset.service";
import type { Asset } from "@portfolio/domain/models/asset.entity";
import { PortfolioAsset } from "@portfolio/domain/models/portfolio-asset.entity";
import { PortfolioTransaction } from "@portfolio/domain/models/portfolio-transaction.entity";
import {
  ASSET_QUOTATION_SERVICE,
  ASSET_REPOSITORY,
  type AssetQuotationService,
  type AssetRepository,
} from "@portfolio/domain/repositories/asset-repository.interface";
import {
  PORTFOLIO_ASSET_REPOSITORY,
  type PortfolioAssetRepository,
} from "@portfolio/domain/repositories/portfolio-asset-repository.interface";
import {
  PORTFOLIO_TRANSACTION_REPOSITORY,
  type PortfolioTransactionRepository,
} from "@portfolio/domain/repositories/portfolio-transaction-repository.interface";
import type {
  AssetHistoryPoint,
  AssetQuote,
  HistoryRange,
} from "@portfolio/domain/services/asset-quotation-service.interface";

@Injectable()
export class PortfolioService {
  constructor(
    @Inject(ASSET_REPOSITORY)
    private readonly assetRepository: AssetRepository,
    @Inject(PORTFOLIO_ASSET_REPOSITORY)
    private readonly portfolioAssetRepository: PortfolioAssetRepository,
    @Inject(PORTFOLIO_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: PortfolioTransactionRepository,
    @Inject(ASSET_QUOTATION_SERVICE)
    private readonly quotationService: AssetQuotationService,
    private readonly assetService: AssetService,
  ) {}

  async addAsset(
    userId: string,
    dto: AddPortfolioAssetDto,
  ): Promise<PortfolioItemDto> {
    const result = await this.addTransaction(userId, {
      ticker: dto.ticker,
      type: "COMPRA",
      operationDate: new Date().toISOString(),
      quantity: dto.quantity,
      unitPrice: dto.averagePrice,
      costs: 0,
    });

    return result.position!;
  }

  async addTransaction(
    userId: string,
    dto: CreatePortfolioTransactionDto,
  ): Promise<PortfolioTransactionResultDto> {
    const ticker = dto.ticker.toUpperCase();
    const asset = await this.assetService.ensureAssetByTicker(ticker);

    const operationDate = new Date(dto.operationDate);
    const costs = dto.costs ?? 0;
    const transaction = PortfolioTransaction.create({
      userId,
      assetId: asset.id!,
      type: dto.type,
      operationDate,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      costs,
    });

    const existing = await this.portfolioAssetRepository.findByUserAndAsset(
      userId,
      asset.id!,
    );

    let savedPosition: PortfolioAsset | null = null;

    if (dto.type === "COMPRA") {
      const effectiveAveragePrice = transaction.totalValue / dto.quantity;

      if (existing) {
        existing.addPosition(dto.quantity, effectiveAveragePrice);
        savedPosition = await this.portfolioAssetRepository.save(existing);
      } else {
        const portfolioAsset = PortfolioAsset.create({
          userId,
          assetId: asset.id!,
          quantity: dto.quantity,
          averagePrice: effectiveAveragePrice,
        });

        savedPosition =
          await this.portfolioAssetRepository.save(portfolioAsset);
      }
    } else {
      if (!existing) {
        throw new AssetNotInPortfolioError(ticker);
      }

      existing.removePosition(dto.quantity);

      if (existing.isEmpty) {
        await this.portfolioAssetRepository.delete(existing.id!);
      } else {
        savedPosition = await this.portfolioAssetRepository.save(existing);
      }
    }

    const savedTransaction =
      await this.transactionRepository.create(transaction);

    const position = savedPosition
      ? await this.toPortfolioItem(savedPosition, asset)
      : null;

    return new PortfolioTransactionResultDto(
      PortfolioTransactionDto.from(savedTransaction, asset),
      position,
    );
  }

  async getPortfolio(
    userId: string,
    range: HistoryRange = "1A",
  ): Promise<PortfolioDto> {
    const [portfolioAssets, transactions] = await Promise.all([
      this.portfolioAssetRepository.findAllByUserId(userId),
      this.transactionRepository.findAllByUserId(userId),
    ]);

    const items = await Promise.all(
      portfolioAssets.map(async (portfolioAsset) => {
        const asset = await this.assetRepository.findById(
          portfolioAsset.assetId,
        );
        return this.toPortfolioItem(portfolioAsset, asset);
      }),
    );

    const dto = new PortfolioDto(items);
    return dto.withHistory(
      this.buildPortfolioHistory(dto.totalInvested, range, transactions),
    );
  }

  async getPortfolioAsset(
    userId: string,
    portfolioAssetId: string,
  ): Promise<PortfolioItemDto> {
    const portfolioAsset =
      await this.portfolioAssetRepository.findById(portfolioAssetId);

    if (!portfolioAsset || portfolioAsset.userId !== userId) {
      throw new PortfolioPositionNotFoundError(portfolioAssetId);
    }

    const asset = await this.assetRepository.findById(portfolioAsset.assetId);
    return this.toPortfolioItem(portfolioAsset, asset);
  }

  async listTransactions(userId: string): Promise<PortfolioTransactionDto[]> {
    const transactions =
      await this.transactionRepository.findAllByUserId(userId);

    return Promise.all(
      transactions.map(async (transaction) => {
        const asset = await this.assetRepository.findById(transaction.assetId);
        return PortfolioTransactionDto.from(transaction, asset);
      }),
    );
  }

  normalizeRange(range?: string): HistoryRange {
    const normalized = range?.toUpperCase();

    if (
      normalized === "1D" ||
      normalized === "1S" ||
      normalized === "1M" ||
      normalized === "3M" ||
      normalized === "1A" ||
      normalized === "TUDO"
    ) {
      return normalized;
    }

    if (normalized === "ALL") return "TUDO";

    return "1A";
  }

  private async getQuote(asset: Asset | null): Promise<AssetQuote | null> {
    if (!asset) return null;
    return this.quotationService.getQuote(asset.ticker);
  }

  private async toPortfolioItem(
    portfolioAsset: PortfolioAsset,
    asset: Asset | null,
  ): Promise<PortfolioItemDto> {
    if (!asset) throw new AssetNotFoundError(portfolioAsset.assetId);

    const quote = await this.getQuote(asset);
    const currentPrice = quote?.price ?? portfolioAsset.averagePrice;
    const currentValue = portfolioAsset.quantity * currentPrice;
    const variationAmount = currentValue - portfolioAsset.totalCost;
    const variationPercent =
      portfolioAsset.totalCost > 0
        ? (variationAmount / portfolioAsset.totalCost) * 100
        : 0;

    return new PortfolioItemDto({
      id: portfolioAsset.id,
      assetId: portfolioAsset.assetId,
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      quantity: portfolioAsset.quantity,
      averagePrice: portfolioAsset.averagePrice,
      totalCost: portfolioAsset.totalCost,
      currentPrice,
      currentValue,
      variationAmount,
      variationPercent,
      changePercent: quote?.changePercent ?? 0,
    });
  }

  private buildPortfolioHistory(
    currentInvested: number,
    range: HistoryRange,
    transactions: PortfolioTransaction[],
  ): AssetHistoryPoint[] {
    const pointsByRange: Record<HistoryRange, number> = {
      "1D": 1,
      "1S": 7,
      "1M": 30,
      "3M": 13,
      "1A": 12,
      TUDO: 0,
    };
    const points = pointsByRange[range];
    const now = new Date();
    const timeline = this.buildHistoryTimeline(
      now,
      range,
      points,
      transactions,
    );

    if (transactions.length === 0) {
      return timeline.map((date) => ({
        date: date.toISOString(),
        value: this.roundMoney(currentInvested),
      }));
    }

    return timeline.map((date) => {
      return {
        date: date.toISOString(),
        value: this.roundMoney(
          this.calculateInvestedValueAt(transactions, date),
        ),
      };
    });
  }

  private buildHistoryTimeline(
    now: Date,
    range: HistoryRange,
    points: number,
    transactions: PortfolioTransaction[],
  ): Date[] {
    if (range === "TUDO") {
      return this.buildAllHistoryTimeline(now, transactions);
    }

    return Array.from({ length: points }, (_, index) => {
      const distance = points - 1 - index;
      return this.historyDate(now, range, distance);
    });
  }

  private buildAllHistoryTimeline(
    now: Date,
    transactions: PortfolioTransaction[],
  ): Date[] {
    if (transactions.length === 0) return [now];

    const firstTransaction = transactions.reduce((earliest, transaction) =>
      transaction.operationDate < earliest.operationDate
        ? transaction
        : earliest,
    );
    const start = firstTransaction.operationDate;
    const elapsedDays = Math.max(
      0,
      Math.ceil((now.getTime() - start.getTime()) / 86_400_000),
    );
    const dates: Date[] = [];
    const cursor = new Date(start);

    const advance = (date: Date) => {
      if (elapsedDays <= 31) {
        date.setDate(date.getDate() + 1);
      } else if (elapsedDays <= 180) {
        date.setDate(date.getDate() + 7);
      } else if (elapsedDays <= 730) {
        date.setMonth(date.getMonth() + 1);
      } else if (elapsedDays <= 1825) {
        date.setMonth(date.getMonth() + 3);
      } else {
        date.setFullYear(date.getFullYear() + 1);
      }
    };

    while (cursor < now) {
      dates.push(new Date(cursor));
      advance(cursor);
    }

    if (dates.length === 0 || dates.at(-1)?.getTime() !== now.getTime()) {
      dates.push(now);
    }

    return dates;
  }

  private calculateInvestedValueAt(
    transactions: PortfolioTransaction[],
    pointDate: Date,
  ): number {
    const positions = new Map<
      string,
      { quantity: number; averagePrice: number }
    >();
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.operationDate.getTime() - b.operationDate.getTime(),
    );

    for (const transaction of sortedTransactions) {
      if (transaction.operationDate > pointDate) continue;

      const position = positions.get(transaction.assetId) ?? {
        quantity: 0,
        averagePrice: 0,
      };

      if (transaction.type === "COMPRA") {
        const totalQuantity = position.quantity + transaction.quantity;
        const totalCost =
          position.quantity * position.averagePrice + transaction.totalValue;

        positions.set(transaction.assetId, {
          quantity: totalQuantity,
          averagePrice: totalCost / totalQuantity,
        });
      } else {
        const remainingQuantity = Math.max(
          position.quantity - transaction.quantity,
          0,
        );

        if (remainingQuantity === 0) {
          positions.delete(transaction.assetId);
        } else {
          positions.set(transaction.assetId, {
            ...position,
            quantity: remainingQuantity,
          });
        }
      }
    }

    return [...positions.values()].reduce(
      (total, position) => total + position.quantity * position.averagePrice,
      0,
    );
  }

  private historyDate(now: Date, range: HistoryRange, distance: number): Date {
    const date = new Date(now);

    if (range === "1D") {
      date.setHours(now.getHours() - distance * 3);
      return date;
    }

    if (range === "1S" || range === "1M") {
      date.setDate(now.getDate() - distance);
      return date;
    }

    if (range === "3M") {
      date.setDate(now.getDate() - distance * 7);
      return date;
    }

    date.setMonth(now.getMonth() - distance);
    return date;
  }

  private roundMoney(value: number): number {
    return Number(value.toFixed(2));
  }
}
