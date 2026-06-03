import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateTransactionDto {
  @ApiProperty({ example: 2500 })
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: "BRL" })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amountBrl?: number;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  exchangeRate?: number;

  @ApiProperty({ example: "income", enum: ["income", "expense", "transfer"] })
  @IsIn(["income", "expense", "transfer"])
  type!: string;

  @ApiProperty({ example: "Pagamento mês" })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: "2026-05-26T00:00:00Z" })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsUUID()
  cardId?: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsString()
  recurringRule?: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: null, required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    required: false,
    description: "UUID gerado pelo cliente para idempotência no sync",
  })
  @IsOptional()
  @IsUUID()
  clientUuid?: string;
}
