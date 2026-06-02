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

export class UpdateTransactionDto {
  @ApiProperty({ example: 2500, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiProperty({ example: "BRL", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;

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

  @ApiProperty({
    example: "income",
    enum: ["income", "expense", "transfer"],
    required: false,
  })
  @IsOptional()
  @IsIn(["income", "expense", "transfer"])
  type?: string;

  @ApiProperty({ example: "Pagamento mês", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({ example: "2026-05-26T00:00:00Z", required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

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
}
