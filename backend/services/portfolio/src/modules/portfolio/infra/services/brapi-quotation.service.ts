import { Injectable } from "@nestjs/common";
import type { AssetType } from "@portfolio/domain/models/asset.entity";
import type { AssetQuotationService } from "@portfolio/domain/repositories/asset-repository.interface";
import type {
  AssetHistoryPoint,
  AssetIndicators,
  AssetMarketListing,
  AssetMarketSearchParams,
  AssetMarketSearchResult,
  AssetQuote,
  HistoryRange,
} from "@portfolio/domain/services/asset-quotation-service.interface";

type BrapiQuoteResult = {
  symbol?: string;
  currency?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  historicalDataPrice?: BrapiHistoricalPrice[];
  summaryProfile?: {
    longBusinessSummary?: string;
  };
  defaultKeyStatistics?: Record<string, unknown>;
};

type BrapiQuoteResponse = {
  results?: BrapiQuoteResult[];
};

type BrapiQuoteListAsset = {
  stock?: string;
  name?: string;
  close?: number;
  change?: number;
  type?: "stock" | "fund" | "bdr" | string;
};

type BrapiQuoteListResponse = {
  stocks?: BrapiQuoteListAsset[];
  currentPage?: number;
  itemsPerPage?: number;
  totalCount?: number;
};

type BrapiHistoricalPrice = {
  date?: number | string;
  close?: number;
  adjustedClose?: number;
  regularMarketPrice?: number;
};

type BrapiCryptoCoin = {
  coin?: string;
  currency?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  historicalDataPrice?: BrapiHistoricalPrice[];
};

type BrapiCryptoResponse = {
  coins?: BrapiCryptoCoin[];
};

type BrapiCryptoAvailableResponse = {
  coins?: string[];
};

type BrapiFiiListItem = {
  symbol?: string;
  name?: string;
  price?: number;
};

type BrapiFiiListResponse = {
  fiis?: BrapiFiiListItem[];
  pagination?: {
    page?: number;
    limit?: number;
    totalItems?: number;
  };
};

type BrapiFiiIndicator = {
  symbol?: string;
  priceToNav?: number | null;
  dividendYield12m?: number | null;
  segmentoAtuacao?: string | null;
  segmentType?: string | null;
  name?: string | null;
};

type BrapiFiiIndicatorsResponse = {
  fiis?: BrapiFiiIndicator[];
};

type MarketFallback = AssetQuote & AssetIndicators;
type PartialIndicators = Partial<AssetIndicators>;

@Injectable()
export class BrapiQuotationService implements AssetQuotationService {
  private readonly baseUrl = "https://brapi.dev/api/quote";
  private readonly quoteListUrl = "https://brapi.dev/api/quote/list";
  private readonly cryptoUrl = "https://brapi.dev/api/v2/crypto";
  private readonly cryptoAvailableUrl =
    "https://brapi.dev/api/v2/crypto/available";
  private readonly fiiListUrl = "https://brapi.dev/api/v2/fii/list";
  private readonly fiiIndicatorsUrl = "https://brapi.dev/api/v2/fii/indicators";
  private readonly token = process.env.BRAPI_TOKEN ?? process.env.BRAPHY_TOKEN;
  private readonly cryptoTickers = new Set([
    "ADA",
    "AVAX",
    "BCH",
    "BNB",
    "BTC",
    "DOGE",
    "DOT",
    "ETH",
    "LINK",
    "LTC",
    "MATIC",
    "SOL",
    "UNI",
    "USDC",
    "USDT",
    "XRP",
  ]);
  private readonly fallback: Record<string, MarketFallback> = {
    PETR4: {
      ticker: "PETR4",
      price: 38.42,
      currency: "BRL",
      change: -0.58,
      changePercent: -1.5,
      pvp: 1.18,
      dy: 16.1,
      dailyLiquidity: 720000000,
      description: "Petrobras PN representa acoes preferenciais da Petrobras.",
    },
    VALE3: {
      ticker: "VALE3",
      price: 62.15,
      currency: "BRL",
      change: -1.47,
      changePercent: -2.3,
      pvp: 1.36,
      dy: 7.8,
      dailyLiquidity: 980000000,
      description: "Vale ON representa acoes ordinarias da Vale.",
    },
    ITUB4: {
      ticker: "ITUB4",
      price: 34.78,
      currency: "BRL",
      change: 0.62,
      changePercent: 1.8,
      pvp: 1.72,
      dy: 5.4,
      dailyLiquidity: 510000000,
      description: "Itau Unibanco PN representa acoes preferenciais do Itau.",
    },
    WEGE3: {
      ticker: "WEGE3",
      price: 42.3,
      currency: "BRL",
      change: 1.32,
      changePercent: 3.2,
      pvp: 10.4,
      dy: 1.7,
      dailyLiquidity: 390000000,
      description: "WEG ON representa acoes ordinarias da WEG.",
    },
    MXRF11: {
      ticker: "MXRF11",
      price: 10.23,
      currency: "BRL",
      change: 0.12,
      changePercent: 1.2,
      pvp: 0.98,
      dy: 13.2,
      dailyLiquidity: 12400000,
      description:
        "Maxi Renda FII e um fundo imobiliario focado em recebiveis imobiliarios, com distribuicao mensal de dividendos.",
    },
    HGLG11: {
      ticker: "HGLG11",
      price: 164.5,
      currency: "BRL",
      change: -1.32,
      changePercent: -0.8,
      pvp: 1.05,
      dy: 8.4,
      dailyLiquidity: 8700000,
      description:
        "CSHG Logistica e um fundo imobiliario com foco em galpoes logisticos.",
    },
    AAPL34: {
      ticker: "AAPL34",
      price: 52.8,
      currency: "BRL",
      change: 1.08,
      changePercent: 2.1,
      pvp: null,
      dy: 0.5,
      dailyLiquidity: 18000000,
      description: "AAPL34 e um BDR lastreado em acoes da Apple.",
    },
    IVVB11: {
      ticker: "IVVB11",
      price: 356.7,
      currency: "BRL",
      change: 2.12,
      changePercent: 0.6,
      pvp: null,
      dy: 0.9,
      dailyLiquidity: 65000000,
      description: "IVVB11 e um ETF que busca acompanhar o indice S&P 500.",
    },
    BTC: {
      ticker: "BTC",
      price: 321000,
      currency: "BRL",
      change: 6420,
      changePercent: 2,
      pvp: null,
      dy: null,
      dailyLiquidity: 1250000000,
      description: "Bitcoin e um criptoativo descentralizado.",
    },
    ETH: {
      ticker: "ETH",
      price: 17250,
      currency: "BRL",
      change: -258.75,
      changePercent: -1.5,
      pvp: null,
      dy: null,
      dailyLiquidity: 610000000,
      description: "Ether e o criptoativo nativo da rede Ethereum.",
    },
  };

  private readonly fallbackTypes: Record<string, AssetType> = {
    PETR4: "ACAO",
    VALE3: "ACAO",
    ITUB4: "ACAO",
    WEGE3: "ACAO",
    MXRF11: "FII",
    HGLG11: "FII",
    AAPL34: "BDR",
    IVVB11: "ETF",
    BTC: "CRIPTO",
    ETH: "CRIPTO",
  };

  private readonly fallbackDescriptions: Record<string, string> = {
    B3SA3:
      "B3SA3 representa acoes ordinarias da B3 S.A., empresa que opera a bolsa de valores brasileira e infraestrutura de mercado financeiro.",
    ITSA4:
      "ITSA4 representa acoes preferenciais da Itausa, holding brasileira com participacoes em empresas como Itau Unibanco, Dexco, Alpargatas e Aegea.",
    ROXO34:
      "ROXO34 e um BDR da Nu Holdings, grupo financeiro controlador do Nubank, com atuacao em servicos bancarios digitais na America Latina.",
    CMIN3:
      "CMIN3 representa acoes ordinarias da CSN Mineracao, companhia focada na producao e exportacao de minerio de ferro.",
    CSAN3:
      "CSAN3 representa acoes ordinarias da Cosan, grupo brasileiro com atuacao em energia, combustiveis, lubrificantes, gas natural e logistica.",
  };

  private readonly cryptoNames: Record<string, string> = {
    ADA: "Cardano",
    AVAX: "Avalanche",
    BCH: "Bitcoin Cash",
    BNB: "BNB",
    BTC: "Bitcoin",
    DOGE: "Dogecoin",
    DOT: "Polkadot",
    ETH: "Ethereum",
    LINK: "Chainlink",
    LTC: "Litecoin",
    MATIC: "Polygon",
    SOL: "Solana",
    UNI: "Uniswap",
    USDC: "USD Coin",
    USDT: "Tether",
    XRP: "XRP",
  };

  async findMarketAsset(ticker: string): Promise<AssetMarketListing | null> {
    const normalizedTicker = ticker.toUpperCase();

    if (this.cryptoTickers.has(normalizedTicker)) {
      return this.marketListingFromCryptoSymbol(normalizedTicker);
    }

    try {
      const result = await this.searchMarketAssets({
        page: 1,
        limit: 20,
        search: normalizedTicker,
      });

      const exactQuoteListMatch = result.items.find(
        (item) => item.ticker === normalizedTicker,
      );

      if (exactQuoteListMatch) {
        return exactQuoteListMatch;
      }

      const fiiResult = await this.searchFiiAssets({
        page: 1,
        limit: 20,
        search: normalizedTicker,
        type: "FII",
      });

      return (
        fiiResult.items.find((item) => item.ticker === normalizedTicker) ??
        this.fallbackMarketListing(normalizedTicker)
      );
    } catch {
      return this.fallbackMarketListing(normalizedTicker);
    }
  }

  async searchMarketAssets(
    params: AssetMarketSearchParams,
  ): Promise<AssetMarketSearchResult> {
    try {
      const normalizedType = params.type?.toUpperCase();

      if (normalizedType === "CRIPTO") {
        return this.searchCryptoAssets(params);
      }

      if (normalizedType === "FII") {
        return this.searchFiiAssets(params);
      }

      if (normalizedType === "ETF") {
        return this.searchEtfAssets(params);
      }

      if (!normalizedType) {
        return this.searchAllAssetTypes(params);
      }

      return this.searchQuoteListAssets(
        params,
        this.toBrapiListType(params.type),
      );
    } catch {
      return this.fallbackMarketSearch(params);
    }
  }

  private async searchAllAssetTypes(
    params: AssetMarketSearchParams,
  ): Promise<AssetMarketSearchResult> {
    const end = params.page * params.limit;
    const secondaryLimit = Math.max(Math.ceil(end / 4), 10);
    const baseParams = { ...params, page: 1 };

    const results = await Promise.allSettled([
      this.searchQuoteListAssets({ ...baseParams, limit: end }),
      this.searchFiiAssets({
        ...baseParams,
        limit: secondaryLimit,
        type: "FII",
      }),
      this.searchEtfAssets({
        ...baseParams,
        limit: secondaryLimit,
        type: "ETF",
      }),
      this.searchCryptoAssets({
        ...baseParams,
        limit: secondaryLimit,
        type: "CRIPTO",
      }),
    ]);
    const sources = results
      .filter(
        (result): result is PromiseFulfilledResult<AssetMarketSearchResult> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    if (sources.length === 0) return this.fallbackMarketSearch(params);

    const merged: AssetMarketListing[] = [];
    const seenTickers = new Set<string>();
    const maxSourceLength = Math.max(
      ...sources.map((source) => source.items.length),
    );

    for (let index = 0; index < maxSourceLength; index += 1) {
      for (const source of sources) {
        const asset = source.items[index];
        if (!asset || seenTickers.has(asset.ticker)) continue;

        seenTickers.add(asset.ticker);
        merged.push(asset);
      }
    }

    const start = (params.page - 1) * params.limit;
    return {
      items: merged.slice(start, end),
      total: sources.reduce((sum, source) => sum + source.total, 0),
      page: params.page,
      limit: params.limit,
    };
  }

  private fallbackMarketListing(ticker: string): AssetMarketListing | null {
    const fallback = this.fallback[ticker];
    const type = this.fallbackTypes[ticker];

    if (!fallback || !type) return null;

    return {
      ticker: fallback.ticker,
      name: fallback.description.split(" representa ")[0] || fallback.ticker,
      type,
      currentPrice: fallback.price,
      change: fallback.change ?? 0,
      changePercent: fallback.changePercent ?? 0,
      currency: fallback.currency,
    };
  }

  private async searchQuoteListAssets(
    params: AssetMarketSearchParams,
    brapiType?: string,
  ): Promise<AssetMarketSearchResult> {
    const url = new URL(this.quoteListUrl);
    url.searchParams.set("page", String(params.page));
    url.searchParams.set("limit", String(params.limit));

    if (params.search) url.searchParams.set("search", params.search);
    if (brapiType) url.searchParams.set("type", brapiType);

    const data = await this.fetchJson<BrapiQuoteListResponse>(url);
    const items = (data.stocks ?? [])
      .map((asset) => this.toQuoteListMarketListing(asset))
      .filter((asset): asset is AssetMarketListing => asset !== null);

    return {
      items,
      total: data.totalCount ?? items.length,
      page: data.currentPage ?? params.page,
      limit: data.itemsPerPage ?? params.limit,
    };
  }

  private async searchFiiAssets(
    params: AssetMarketSearchParams,
  ): Promise<AssetMarketSearchResult> {
    try {
      const url = new URL(this.fiiListUrl);
      url.searchParams.set("page", String(params.page));
      url.searchParams.set("limit", String(params.limit));

      if (params.search) url.searchParams.set("search", params.search);

      const data = await this.fetchJson<BrapiFiiListResponse>(url);
      const tickers = (data.fiis ?? [])
        .map((fii) => fii.symbol?.toUpperCase())
        .filter((ticker): ticker is string => Boolean(ticker));
      const quotes = await this.getQuotes(tickers);
      const quoteMap = new Map(quotes.map((quote) => [quote.ticker, quote]));
      const items = (data.fiis ?? [])
        .map((fii) => this.toFiiMarketListing(fii, quoteMap))
        .filter((asset): asset is AssetMarketListing => asset !== null);

      return {
        items,
        total: data.pagination?.totalItems ?? items.length,
        page: data.pagination?.page ?? params.page,
        limit: data.pagination?.limit ?? params.limit,
      };
    } catch {
      return this.fallbackMarketSearch({ ...params, type: "FII" });
    }
  }

  private async searchEtfAssets(
    params: AssetMarketSearchParams,
  ): Promise<AssetMarketSearchResult> {
    const requestLimit = Math.max(params.limit * params.page * 4, 50);
    const result = await this.searchQuoteListAssets(
      {
        page: 1,
        limit: requestLimit,
        search: params.search,
        type: "ETF",
      },
      "fund",
    );
    const etfs = result.items.filter((asset) => asset.type === "ETF");
    const start = (params.page - 1) * params.limit;

    return {
      items: etfs.slice(start, start + params.limit),
      total: etfs.length,
      page: params.page,
      limit: params.limit,
    };
  }

  private async searchCryptoAssets(
    params: AssetMarketSearchParams,
  ): Promise<AssetMarketSearchResult> {
    try {
      const url = new URL(this.cryptoAvailableUrl);
      if (params.search) url.searchParams.set("search", params.search);

      const data = await this.fetchJson<BrapiCryptoAvailableResponse>(url);
      const normalizedSearch = params.search?.toUpperCase();
      const coins = (data.coins ?? [])
        .map((coin) => coin.toUpperCase())
        .filter((coin) => !normalizedSearch || coin.includes(normalizedSearch));
      const start = (params.page - 1) * params.limit;
      const pageCoins = coins.slice(start, start + params.limit);
      const quotes = await this.getQuotes(pageCoins);
      const quoteMap = new Map(quotes.map((quote) => [quote.ticker, quote]));

      return {
        items: pageCoins.map((coin) =>
          this.marketListingFromCryptoSymbol(coin, quoteMap.get(coin)),
        ),
        total: coins.length,
        page: params.page,
        limit: params.limit,
      };
    } catch {
      return this.fallbackMarketSearch({ ...params, type: "CRIPTO" });
    }
  }

  private fallbackMarketSearch(
    params: AssetMarketSearchParams,
  ): AssetMarketSearchResult {
    const normalizedType = params.type?.toUpperCase();
    const normalizedSearch = params.search?.toUpperCase();
    const items = Object.keys(this.fallbackTypes)
      .filter((ticker) => {
        const type = this.fallbackTypes[ticker];
        const matchesType = !normalizedType || type === normalizedType;
        const matchesSearch =
          !normalizedSearch ||
          ticker.includes(normalizedSearch) ||
          (this.fallback[ticker]?.description ?? "")
            .toUpperCase()
            .includes(normalizedSearch);

        return matchesType && matchesSearch;
      })
      .map((ticker) => this.fallbackMarketListing(ticker))
      .filter((asset): asset is AssetMarketListing => asset !== null);
    const start = (params.page - 1) * params.limit;

    return {
      items: items.slice(start, start + params.limit),
      total: items.length,
      page: params.page,
      limit: params.limit,
    };
  }

  private toQuoteListMarketListing(
    asset: BrapiQuoteListAsset,
  ): AssetMarketListing | null {
    if (!asset.stock) return null;

    const ticker = asset.stock.toUpperCase();
    const currentPrice = asset.close ?? 0;
    const changePercent = asset.change ?? 0;

    return {
      ticker,
      name: asset.name || ticker,
      type: this.fromBrapiAssetType(asset.type, ticker, asset.name),
      currentPrice,
      change: this.roundMoney(currentPrice * (changePercent / 100)),
      changePercent,
      currency: "BRL",
    };
  }

  private toFiiMarketListing(
    fii: BrapiFiiListItem,
    quoteMap: Map<string, AssetQuote>,
  ): AssetMarketListing | null {
    if (!fii.symbol) return null;

    const ticker = fii.symbol.toUpperCase();
    const quote = quoteMap.get(ticker);

    return {
      ticker,
      name: fii.name || ticker,
      type: "FII",
      currentPrice: quote?.price ?? fii.price ?? 0,
      change: quote?.change ?? 0,
      changePercent: quote?.changePercent ?? 0,
      currency: quote?.currency ?? "BRL",
    };
  }

  private marketListingFromCryptoSymbol(
    ticker: string,
    quote?: AssetQuote,
  ): AssetMarketListing {
    const fallback = this.fallback[ticker];

    return {
      ticker,
      name: this.cryptoNames[ticker] ?? fallback?.description ?? ticker,
      type: "CRIPTO",
      currentPrice: quote?.price ?? fallback?.price ?? 0,
      change: quote?.change ?? fallback?.change ?? 0,
      changePercent: quote?.changePercent ?? fallback?.changePercent ?? 0,
      currency: quote?.currency ?? fallback?.currency ?? "BRL",
    };
  }

  private fromBrapiAssetType(
    type: string | undefined,
    ticker: string,
    name?: string,
  ): AssetType {
    if (type === "bdr") return "BDR";
    if (type === "stock") return "ACAO";
    if (type === "fund") {
      return name?.toUpperCase().includes("FII") ? "FII" : "ETF";
    }

    return this.fallbackTypes[ticker] ?? "ACAO";
  }

  private toBrapiListType(type?: string): string | undefined {
    const normalizedType = type?.toUpperCase();

    if (normalizedType === "ACAO") return "stock";
    if (normalizedType === "BDR") return "bdr";

    return undefined;
  }

  async getQuote(ticker: string): Promise<AssetQuote | null> {
    const normalizedTicker = ticker.toUpperCase();

    if (this.cryptoTickers.has(normalizedTicker)) {
      return (
        (await this.fetchCryptoQuote(normalizedTicker)) ??
        this.fallbackQuote(normalizedTicker)
      );
    }

    try {
      const url = new URL(`${this.baseUrl}/${normalizedTicker}`);
      const data = await this.fetchJson<BrapiQuoteResponse>(url);

      return (
        this.toQuote(data.results?.[0]) ?? this.fallbackQuote(normalizedTicker)
      );
    } catch {
      return this.fallbackQuote(normalizedTicker);
    }
  }

  async getQuotes(tickers: string[]): Promise<AssetQuote[]> {
    if (tickers.length === 0) return [];

    const quotes = await Promise.all(
      tickers.map((ticker) => this.getQuote(ticker)),
    );

    return quotes.filter((quote): quote is AssetQuote => quote !== null);
  }

  async getHistory(
    ticker: string,
    range: HistoryRange,
  ): Promise<AssetHistoryPoint[]> {
    const normalizedTicker = ticker.toUpperCase();
    const brapiHistory = this.cryptoTickers.has(normalizedTicker)
      ? await this.fetchCryptoHistory(normalizedTicker, range)
      : await this.fetchQuoteHistory(normalizedTicker, range);

    if (brapiHistory.length > 0) {
      return brapiHistory;
    }

    return [];
  }

  async getIndicators(ticker: string): Promise<AssetIndicators> {
    const normalizedTicker = ticker.toUpperCase();
    const fallback = this.fallback[normalizedTicker];
    const [fiiIndicators, quoteIndicators] = await Promise.all([
      this.fetchFiiIndicators(normalizedTicker),
      this.fetchQuoteIndicators(normalizedTicker),
    ]);

    const generatedPvp = this.roundNumber(
      0.7 + (this.hash(normalizedTicker) % 180) / 100,
      2,
    );
    const generatedDy = this.roundNumber(
      (this.hash(normalizedTicker) % 140) / 10,
      2,
    );

    return {
      pvp:
        fiiIndicators.pvp ??
        quoteIndicators.pvp ??
        fallback?.pvp ??
        generatedPvp,
      dy: fiiIndicators.dy ?? quoteIndicators.dy ?? fallback?.dy ?? generatedDy,
      dailyLiquidity:
        quoteIndicators.dailyLiquidity ??
        fallback?.dailyLiquidity ??
        (this.hash(normalizedTicker) % 90000000) + 1000000,
      description:
        quoteIndicators.description ??
        fiiIndicators.description ??
        fallback?.description ??
        this.fallbackDescriptions[normalizedTicker] ??
        `${normalizedTicker} e um ativo financeiro acompanhado pelo portfolio.`,
    };
  }

  private toQuote(result?: BrapiQuoteResult): AssetQuote | null {
    if (!result?.symbol || typeof result.regularMarketPrice !== "number") {
      return null;
    }

    return {
      ticker: result.symbol,
      price: result.regularMarketPrice,
      currency: result.currency ?? "BRL",
      change: result.regularMarketChange,
      changePercent: result.regularMarketChangePercent,
    };
  }

  private toCryptoQuote(result?: BrapiCryptoCoin): AssetQuote | null {
    if (!result?.coin || typeof result.regularMarketPrice !== "number") {
      return null;
    }

    return {
      ticker: result.coin,
      price: result.regularMarketPrice,
      currency: result.currency ?? "BRL",
      change: result.regularMarketChange,
      changePercent: result.regularMarketChangePercent,
    };
  }

  private async fetchJson<T>(url: URL): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Brapi request failed with status ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchCryptoQuote(ticker: string): Promise<AssetQuote | null> {
    try {
      const url = new URL(this.cryptoUrl);
      url.searchParams.set("coin", ticker);
      url.searchParams.set("currency", "BRL");
      const data = await this.fetchJson<BrapiCryptoResponse>(url);

      return this.toCryptoQuote(data.coins?.[0]);
    } catch {
      return null;
    }
  }

  private async fetchQuoteHistory(
    ticker: string,
    range: HistoryRange,
  ): Promise<AssetHistoryPoint[]> {
    try {
      const params = this.toBrapiRange(range);
      const url = new URL(`${this.baseUrl}/${ticker}`);
      url.searchParams.set("range", params.range);
      url.searchParams.set("interval", params.interval);
      const data = await this.fetchJson<BrapiQuoteResponse>(url);

      return this.toHistory(data.results?.[0]?.historicalDataPrice);
    } catch {
      return [];
    }
  }

  private async fetchCryptoHistory(
    ticker: string,
    range: HistoryRange,
  ): Promise<AssetHistoryPoint[]> {
    try {
      const params = this.toBrapiRange(range);
      const url = new URL(this.cryptoUrl);
      url.searchParams.set("coin", ticker);
      url.searchParams.set("currency", "BRL");
      url.searchParams.set("range", params.range);
      url.searchParams.set("interval", params.interval);
      const data = await this.fetchJson<BrapiCryptoResponse>(url);

      return this.toHistory(data.coins?.[0]?.historicalDataPrice);
    } catch {
      return [];
    }
  }

  private async fetchQuoteIndicators(
    ticker: string,
  ): Promise<PartialIndicators> {
    try {
      const url = new URL(`${this.baseUrl}/${ticker}`);
      url.searchParams.set("modules", "summaryProfile,defaultKeyStatistics");
      const data = await this.fetchJson<BrapiQuoteResponse>(url);
      const result = data.results?.[0];
      const statistics = result?.defaultKeyStatistics ?? {};
      const pvp = this.firstNumber(statistics, [
        "priceToBook",
        "priceToBookRatio",
        "pvp",
      ]);
      const dy = this.toPercent(
        this.firstNumber(statistics, [
          "dividendYield",
          "trailingAnnualDividendYield",
          "yield",
        ]),
      );
      const dailyLiquidity =
        typeof result?.regularMarketVolume === "number" &&
        typeof result.regularMarketPrice === "number"
          ? this.roundMoney(
              result.regularMarketVolume * result.regularMarketPrice,
            )
          : null;

      return {
        pvp,
        dy,
        dailyLiquidity,
        description: result?.summaryProfile?.longBusinessSummary,
      };
    } catch {
      return {};
    }
  }

  private async fetchFiiIndicators(ticker: string): Promise<PartialIndicators> {
    try {
      const url = new URL(this.fiiIndicatorsUrl);
      url.searchParams.set("symbols", ticker);
      const data = await this.fetchJson<BrapiFiiIndicatorsResponse>(url);
      const result = data.fiis?.[0];

      if (!result) return {};

      return {
        pvp: result.priceToNav ?? null,
        dy: this.toPercent(result.dividendYield12m ?? null),
        description: this.fiiDescription(result),
      };
    } catch {
      return {};
    }
  }

  private toHistory(points?: BrapiHistoricalPrice[]): AssetHistoryPoint[] {
    return (points ?? [])
      .map((point) => {
        const date = this.toIsoDate(point.date);
        const value = this.numberFromUnknown(
          point.adjustedClose ?? point.close ?? point.regularMarketPrice,
        );

        if (!date || value === null) return null;

        return {
          date,
          value: this.roundMoney(value),
        };
      })
      .filter((point): point is AssetHistoryPoint => point !== null);
  }

  private toIsoDate(value?: number | string): string | null {
    if (typeof value === "number") {
      const milliseconds = value > 10_000_000_000 ? value : value * 1000;
      return new Date(milliseconds).toISOString();
    }

    if (typeof value === "string") {
      const numericValue = Number(value);

      if (!Number.isNaN(numericValue)) {
        return this.toIsoDate(numericValue);
      }

      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    return null;
  }

  private toBrapiRange(range: HistoryRange): {
    range: string;
    interval: string;
  } {
    const ranges: Record<HistoryRange, { range: string; interval: string }> = {
      "1D": { range: "1d", interval: "1h" },
      "1S": { range: "7d", interval: "1d" },
      "1M": { range: "1mo", interval: "1d" },
      "3M": { range: "3mo", interval: "1d" },
      "1A": { range: "1y", interval: "1wk" },
      TUDO: { range: "max", interval: "1mo" },
    };

    return ranges[range];
  }

  private firstNumber(
    source: Record<string, unknown>,
    keys: string[],
  ): number | null {
    for (const key of keys) {
      const value = this.numberFromUnknown(source[key]);

      if (value !== null) {
        return value;
      }
    }

    return null;
  }

  private numberFromUnknown(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (typeof value === "object" && value !== null && "raw" in value) {
      return this.numberFromUnknown((value as { raw?: unknown }).raw);
    }

    return null;
  }

  private toPercent(value: number | null): number | null {
    if (value === null) return null;
    return this.roundNumber(Math.abs(value) <= 1 ? value * 100 : value, 2);
  }

  private fiiDescription(result: BrapiFiiIndicator): string | undefined {
    if (!result.name) return undefined;

    const details = [result.segmentType, result.segmentoAtuacao]
      .filter(Boolean)
      .join(" - ");

    return details ? `${result.name} (${details}).` : result.name;
  }

  private fallbackQuote(ticker: string): AssetQuote {
    const fallback = this.fallback[ticker];

    if (fallback) {
      return {
        ticker: fallback.ticker,
        price: fallback.price,
        currency: fallback.currency,
        change: fallback.change,
        changePercent: fallback.changePercent,
      };
    }

    const price = this.syntheticPrice(ticker);
    const changePercent = this.roundNumber(
      (this.hash(ticker) % 700) / 100 - 3.5,
      2,
    );

    return {
      ticker,
      price,
      currency: "BRL",
      change: this.roundMoney(price * (changePercent / 100)),
      changePercent,
    };
  }

  private syntheticPrice(ticker: string): number {
    return this.roundMoney(8 + (this.hash(ticker) % 45000) / 100);
  }

  private hash(value: string): number {
    return value
      .split("")
      .reduce((total, char) => total + char.charCodeAt(0) * 17, 0);
  }

  private roundMoney(value: number): number {
    return this.roundNumber(value, 2);
  }

  private roundNumber(value: number, decimals: number): number {
    return Number(value.toFixed(decimals));
  }
}
