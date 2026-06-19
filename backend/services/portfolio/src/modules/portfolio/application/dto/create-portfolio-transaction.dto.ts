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
  @IsString({ message: "ticker deve ser um texto." })
  @IsNotEmpty({ message: "ticker é obrigatório." })
  ticker!: string;

  @ApiProperty({ enum: PortfolioTransactionTypes, example: "COMPRA" })
  @IsIn(PortfolioTransactionTypes, {
    message: "type deve ser COMPRA ou VENDA.",
  })
  type!: PortfolioTransactionType;

  @ApiProperty({ example: "2026-05-16" })
  @IsDateString({}, { message: "operationDate deve ser uma data válida." })
  operationDate!: string;

  @ApiProperty({ example: 10 })
  @IsInt({ message: "quantity deve ser um número inteiro." })
  @IsPositive({ message: "quantity deve ser maior que zero." })
  quantity!: number;

  @ApiProperty({ example: 38.42 })
  @IsNumber({}, { message: "unitPrice deve ser um número." })
  @IsPositive({ message: "unitPrice deve ser maior que zero." })
  unitPrice!: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber({}, { message: "costs deve ser um número." })
  @Min(0, { message: "costs não pode ser negativo." })
  @IsOptional()
  costs?: number;
}
