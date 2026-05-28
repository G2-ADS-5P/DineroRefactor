import { ApiProperty } from "@nestjs/swagger";

export class PortfolioItemDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid" })
  assetId: string;

  @ApiProperty({ example: "PETR4" })
  ticker: string;

  @ApiProperty({ example: "Petrobras PN" })
  name: string;

  @ApiProperty({ example: "ACAO" })
  type: string;

  @ApiProperty({ example: 10 })
  quantity: number;

  @ApiProperty({ example: 32.5 })
  averagePrice: number;

  @ApiProperty({ example: 325 })
  totalCost: number;

  @ApiProperty({ example: 38.42 })
  currentPrice: number;

  @ApiProperty({ example: 384.2 })
  currentValue: number;

  @ApiProperty({ example: 59.2 })
  variationAmount: number;

  @ApiProperty({ example: 18.22 })
  variationPercent: number;

  @ApiProperty({ example: 1.2 })
  changePercent: number;

  constructor(props: {
    id: string | undefined;
    assetId: string;
    ticker: string;
    name: string;
    type: string;
    quantity: number;
    averagePrice: number;
    totalCost: number;
    currentPrice?: number;
    currentValue?: number;
    variationAmount?: number;
    variationPercent?: number;
    changePercent?: number;
  }) {
    this.id = props.id;
    this.assetId = props.assetId;
    this.ticker = props.ticker;
    this.name = props.name;
    this.type = props.type;
    this.quantity = props.quantity;
    this.averagePrice = props.averagePrice;
    this.totalCost = props.totalCost;
    this.currentPrice = props.currentPrice ?? props.averagePrice;
    this.currentValue = props.currentValue ?? props.totalCost;
    this.variationAmount = props.variationAmount ?? 0;
    this.variationPercent = props.variationPercent ?? 0;
    this.changePercent = props.changePercent ?? 0;
  }
}

export class PortfolioDto {
  @ApiProperty({ type: [PortfolioItemDto] })
  items: PortfolioItemDto[];

  @ApiProperty({ example: 1 })
  totalAssets: number;

  @ApiProperty({ example: 325 })
  totalCost: number;

  @ApiProperty({ example: 325 })
  totalInvested: number;

  @ApiProperty({ example: 384.2 })
  currentValue: number;

  @ApiProperty({ example: 59.2 })
  variationAmount: number;

  @ApiProperty({ example: 18.22 })
  variationPercent: number;

  @ApiProperty({
    example: [
      { date: "2026-01-01", value: 1000 },
      { date: "2026-02-01", value: 1100 },
    ],
  })
  history: { date: string; value: number }[];

  constructor(items: PortfolioItemDto[]) {
    this.items = items;
    this.totalAssets = items.length;
    this.totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
    this.totalInvested = this.totalCost;
    this.currentValue = items.reduce((sum, item) => sum + item.currentValue, 0);
    this.variationAmount = this.currentValue - this.totalInvested;
    this.variationPercent =
      this.totalInvested > 0
        ? (this.variationAmount / this.totalInvested) * 100
        : 0;
    this.history = [];
  }

  withHistory(history: { date: string; value: number }[]): PortfolioDto {
    this.history = history;
    return this;
  }
}
