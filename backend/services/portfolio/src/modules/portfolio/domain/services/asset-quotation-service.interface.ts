import type { AssetType } from "@portfolio/domain/models/asset.entity";

export interface AssetQuote {
  ticker: string;
  price: number;
  currency: string;
  change?: number;
  changePercent?: number;
}

export type HistoryRange = "1D" | "1S" | "1M" | "3M" | "1A" | "TUDO";

export interface AssetHistoryPoint {
  date: string;
  value: number;
}

export interface AssetIndicators {
  pvp: number | null;
  dy: number | null;
  dailyLiquidity: number | null;
  description: string;
}

export interface AssetMarketListing {
  ticker: string;
  name: string;
  type: AssetType;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency: string;
}

export interface AssetMarketSearchParams {
  page: number;
  limit: number;
  search?: string;
  type?: string;
}

export interface AssetMarketSearchResult {
  items: AssetMarketListing[];
  total: number;
  page: number;
  limit: number;
}
