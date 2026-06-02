import { ApiProperty } from "@nestjs/swagger";
import { AssetDto } from "@portfolio/application/dto/asset.dto";
import { AssetHistoryPointDto } from "@portfolio/application/dto/asset-history.dto";
import type { Asset } from "@portfolio/domain/models/asset.entity";
import type { AssetQuote } from "@portfolio/domain/services/asset-quotation-service.interface";

export class AssetMarketDto extends AssetDto {
  @ApiProperty({ example: 38.42 })
  currentPrice: number;

  @ApiProperty({ example: -0.58 })
  change: number;

  @ApiProperty({ example: -1.5 })
  changePercent: number;

  @ApiProperty({ example: "BRL" })
  currency: string;

  @ApiProperty({ type: [AssetHistoryPointDto] })
  history: AssetHistoryPointDto[];

  constructor(props: {
    id: string | undefined;
    ticker: string;
    name: string;
    type: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    currency: string;
    history: AssetHistoryPointDto[];
  }) {
    super(props.id, props.ticker, props.name, props.type);
    this.currentPrice = props.currentPrice;
    this.change = props.change;
    this.changePercent = props.changePercent;
    this.currency = props.currency;
    this.history = props.history;
  }

  static fromMarket(
    asset: Asset,
    quote: AssetQuote | null,
    history: AssetHistoryPointDto[],
  ): AssetMarketDto {
    return new AssetMarketDto({
      id: asset.id,
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      currentPrice: quote?.price ?? 0,
      change: quote?.change ?? 0,
      changePercent: quote?.changePercent ?? 0,
      currency: quote?.currency ?? "BRL",
      history,
    });
  }
}
