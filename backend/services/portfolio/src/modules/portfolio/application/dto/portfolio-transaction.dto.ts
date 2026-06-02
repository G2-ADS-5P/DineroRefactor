import { ApiProperty } from "@nestjs/swagger";
import type {
  PortfolioTransaction,
  PortfolioTransactionType,
} from "@portfolio/domain/models/portfolio-transaction.entity";

export class PortfolioTransactionDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid" })
  assetId: string;

  @ApiProperty({ example: "PETR4" })
  ticker: string;

  @ApiProperty({ example: "Petrobras PN" })
  name: string;

  @ApiProperty({ example: "COMPRA" })
  type: PortfolioTransactionType;

  @ApiProperty({ example: "2026-05-16T00:00:00.000Z" })
  operationDate: Date;

  @ApiProperty({ example: 10 })
  quantity: number;

  @ApiProperty({ example: 38.42 })
  unitPrice: number;

  @ApiProperty({ example: 0 })
  costs: number;

  @ApiProperty({ example: 384.2 })
  totalValue: number;

  constructor(props: {
    id: string | undefined;
    assetId: string;
    ticker: string;
    name: string;
    type: PortfolioTransactionType;
    operationDate: Date;
    quantity: number;
    unitPrice: number;
    costs: number;
    totalValue: number;
  }) {
    this.id = props.id;
    this.assetId = props.assetId;
    this.ticker = props.ticker;
    this.name = props.name;
    this.type = props.type;
    this.operationDate = props.operationDate;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.costs = props.costs;
    this.totalValue = props.totalValue;
  }

  static from(
    transaction: PortfolioTransaction,
    asset: { ticker: string; name: string } | null,
  ): PortfolioTransactionDto {
    return new PortfolioTransactionDto({
      id: transaction.id,
      assetId: transaction.assetId,
      ticker: asset?.ticker ?? "UNKNOWN",
      name: asset?.name ?? "Unknown",
      type: transaction.type,
      operationDate: transaction.operationDate,
      quantity: transaction.quantity,
      unitPrice: transaction.unitPrice,
      costs: transaction.costs,
      totalValue: transaction.totalValue,
    });
  }
}
