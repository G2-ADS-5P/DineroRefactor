import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AssetDto } from "@portfolio/application/dto/asset.dto";
import {
  AssetDetailDto,
  AssetIndicatorsDto,
} from "@portfolio/application/dto/asset-detail.dto";
import { AssetHistoryPointDto } from "@portfolio/application/dto/asset-history.dto";
import { AssetMarketDto } from "@portfolio/application/dto/asset-market.dto";
import { CreateAssetDto } from "@portfolio/application/dto/create-asset.dto";
import { Asset } from "@portfolio/domain/models/asset.entity";
import {
  ASSET_QUOTATION_SERVICE,
  ASSET_REPOSITORY,
  type AssetQuotationService,
  type AssetRepository,
  type AssetSearchParams,
} from "@portfolio/domain/repositories/asset-repository.interface";
import {
  PORTFOLIO_ASSET_REPOSITORY,
  type PortfolioAssetRepository,
} from "@portfolio/domain/repositories/portfolio-asset-repository.interface";
import type {
  AssetMarketListing,
  AssetQuote,
  HistoryRange,
} from "@portfolio/domain/services/asset-quotation-service.interface";
import type { PaginatedResult } from "@shared/infra/hateoas";

@Injectable()
export class AssetService {
  constructor(
    @Inject(ASSET_REPOSITORY)
    private readonly assetRepository: AssetRepository,
    @Inject(ASSET_QUOTATION_SERVICE)
    private readonly quotationService: AssetQuotationService,
    @Inject(PORTFOLIO_ASSET_REPOSITORY)
    private readonly portfolioAssetRepository: PortfolioAssetRepository,
  ) {}

  async create(dto: CreateAssetDto): Promise<AssetDto> {
    const existing = await this.assetRepository.findByTicker(dto.ticker);

    if (existing) {
      throw new ConflictException("Ticker already registered");
    }

    const asset = Asset.create(dto);
    const created = await this.assetRepository.save(asset);

    return AssetDto.from(created)!;
  }

  async list(): Promise<AssetDto[]> {
    const assets = await this.assetRepository.findAll();
    return assets.map((asset) => AssetDto.from(asset)!);
  }

  async listPaginated(
    params: AssetSearchParams & { range?: HistoryRange },
  ): Promise<PaginatedResult<AssetMarketDto>> {
    const marketResult = await this.quotationService.searchMarketAssets(params);

    if (marketResult.items.length > 0) {
      const data = await Promise.all(
        marketResult.items.map(async (marketAsset) => {
          const asset = await this.createOrUpdateMarketAsset(marketAsset);
          const history = await this.getHistoryPoints(
            asset.ticker,
            params.range ?? "1M",
          );

          return AssetMarketDto.fromMarket(
            asset,
            this.marketAssetToQuote(marketAsset),
            history,
          );
        }),
      );

      return {
        data,
        total: marketResult.total,
        page: marketResult.page,
        limit: marketResult.limit,
      };
    }

    const { rows, total } = await this.assetRepository.findAllPaginated(params);
    const quotes = await this.quotationService.getQuotes(
      rows.map((asset) => asset.ticker),
    );
    const quoteMap = new Map(quotes.map((quote) => [quote.ticker, quote]));

    const data = await Promise.all(
      rows.map(async (asset) => {
        const history = await this.getHistoryPoints(
          asset.ticker,
          params.range ?? "1M",
        );

        return AssetMarketDto.fromMarket(
          asset,
          quoteMap.get(asset.ticker) ?? null,
          history,
        );
      }),
    );

    return {
      data,
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<AssetDto | null> {
    const asset = await this.assetRepository.findById(id);
    return AssetDto.from(asset);
  }

  async getById(id: string): Promise<AssetDto> {
    const asset = await this.findById(id);
    if (!asset) throw new NotFoundException("Asset not found");
    return asset;
  }

  async getDetail(
    userId: string,
    id: string,
    range: HistoryRange,
  ): Promise<AssetDetailDto> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) throw new NotFoundException("Asset not found");

    const [quote, indicators, history, position] = await Promise.all([
      this.quotationService.getQuote(asset.ticker),
      this.quotationService.getIndicators(asset.ticker),
      this.getHistoryPoints(asset.ticker, range),
      this.portfolioAssetRepository.findByUserAndAsset(userId, asset.id!),
    ]);

    return new AssetDetailDto({
      id: asset.id,
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      currentPrice: quote?.price ?? 0,
      change: quote?.change ?? 0,
      changePercent: quote?.changePercent ?? 0,
      currency: quote?.currency ?? "BRL",
      history,
      indicators: new AssetIndicatorsDto({
        pvp: indicators.pvp,
        dy: indicators.dy,
        dailyLiquidity: indicators.dailyLiquidity,
        averagePrice: position?.averagePrice ?? null,
      }),
      description: indicators.description,
    });
  }

  async getHistory(
    id: string,
    range: HistoryRange,
  ): Promise<AssetHistoryPointDto[]> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) throw new NotFoundException("Asset not found");

    return this.getHistoryPoints(asset.ticker, range);
  }

  async ensureAssetByTicker(ticker: string): Promise<Asset> {
    const normalizedTicker = ticker.toUpperCase();
    const existing = await this.assetRepository.findByTicker(normalizedTicker);

    if (existing) return existing;

    const marketAsset =
      await this.quotationService.findMarketAsset(normalizedTicker);

    if (!marketAsset) {
      throw new NotFoundException(`Asset ${normalizedTicker} not found`);
    }

    return this.createOrUpdateMarketAsset(marketAsset);
  }

  normalizeType(type?: string): string | undefined {
    if (!type || type.toLowerCase() === "todos") return undefined;

    const normalized = type
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

    const aliases: Record<string, string> = {
      ACAO: "ACAO",
      ACOES: "ACAO",
      FII: "FII",
      FIIS: "FII",
      BDR: "BDR",
      BDRS: "BDR",
      ETF: "ETF",
      ETFS: "ETF",
      CRIPTO: "CRIPTO",
      CRYPTO: "CRIPTO",
      RENDA_FIXA: "RENDA_FIXA",
    };

    return aliases[normalized] ?? normalized;
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

  private async getHistoryPoints(
    ticker: string,
    range: HistoryRange,
  ): Promise<AssetHistoryPointDto[]> {
    const history = await this.quotationService.getHistory(ticker, range);
    return history.map(
      (point) => new AssetHistoryPointDto(point.date, point.value),
    );
  }

  private async createOrUpdateMarketAsset(
    marketAsset: AssetMarketListing,
  ): Promise<Asset> {
    const existing = await this.assetRepository.findByTicker(
      marketAsset.ticker,
    );
    const asset = Asset.create({
      ticker: marketAsset.ticker,
      name: existing?.name ?? marketAsset.name,
      type: existing?.type ?? marketAsset.type,
    });

    return this.assetRepository.save(asset);
  }

  private marketAssetToQuote(marketAsset: AssetMarketListing): AssetQuote {
    return {
      ticker: marketAsset.ticker,
      price: marketAsset.currentPrice,
      currency: marketAsset.currency,
      change: marketAsset.change,
      changePercent: marketAsset.changePercent,
    };
  }
}
