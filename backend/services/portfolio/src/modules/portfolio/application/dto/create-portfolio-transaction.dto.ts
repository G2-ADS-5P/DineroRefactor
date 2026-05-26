import { ApiProperty } from "@nestjs/swagger";
import {
  type PortfolioTransactionType,
  PortfolioTransactionTypes,
} from "@portfolio/domain/models/portfolio-transaction.entity";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from "class-validator";

export class CreatePortfolioTransactionDto {
  @ApiProperty({ example: "PETR4" })
  @IsString()
  @IsNotEmpty()
  ticker!: string;

  @ApiProperty({ enum: PortfolioTransactionTypes, example: "COMPRA" })
  @IsIn(PortfolioTransactionTypes)
  type!: PortfolioTransactionType;

  @ApiProperty({ example: "2026-05-16" })
  @IsDateString()
  operationDate!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ example: 38.42 })
  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costs?: number;
}
