import type { Asset } from "@portfolio/domain/models/asset.entity";
import type {
  AssetHistoryPoint,
  AssetIndicators,
  AssetMarketListing,
  AssetMarketSearchParams,
  AssetMarketSearchResult,
  AssetQuote,
  HistoryRange,
} from "@portfolio/domain/services/asset-quotation-service.interface";
import type { PaginationParams } from "@shared/infra/hateoas";

export const ASSET_REPOSITORY = Symbol("ASSET_REPOSITORY");
export const ASSET_QUOTATION_SERVICE = Symbol("ASSET_QUOTATION_SERVICE");

export interface AssetSearchParams extends PaginationParams {
  search?: string;
  type?: string;
}

export interface AssetRepository {
  save(asset: Asset): Promise<Asset>;
  findById(id: string): Promise<Asset | null>;
  findByTicker(ticker: string): Promise<Asset | null>;
  findAll(): Promise<Asset[]>;
  findAllPaginated(
    params: AssetSearchParams,
  ): Promise<{ rows: Asset[]; total: number }>;
}

export interface AssetQuotationService {
  findMarketAsset(ticker: string): Promise<AssetMarketListing | null>;
  searchMarketAssets(
    params: AssetMarketSearchParams,
  ): Promise<AssetMarketSearchResult>;
  getQuote(ticker: string): Promise<AssetQuote | null>;
  getQuotes(tickers: string[]): Promise<AssetQuote[]>;
  getHistory(ticker: string, range: HistoryRange): Promise<AssetHistoryPoint[]>;
  getIndicators(ticker: string): Promise<AssetIndicators>;
}
