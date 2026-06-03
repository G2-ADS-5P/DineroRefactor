import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
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
  ValidateNested,
} from "class-validator";

export class SyncTransactionItemDto {
  @ApiProperty({ enum: ["CREATE", "UPDATE", "DELETE"] })
  @IsIn(["CREATE", "UPDATE", "DELETE"])
  operation!: string;

  @ApiProperty({ description: "UUID gerado pelo cliente para idempotência" })
  @IsUUID()
  clientUuid!: string;

  @ApiProperty({
    required: false,
    description: "ID server-side (UPDATE/DELETE)",
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amountBrl?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  exchangeRate?: number;

  @ApiProperty({ required: false, enum: ["income", "expense", "transfer"] })
  @IsOptional()
  @IsIn(["income", "expense", "transfer"])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  cardId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recurringRule?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SyncPushDto {
  @ApiProperty({ type: [SyncTransactionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncTransactionItemDto)
  items!: SyncTransactionItemDto[];
}

export class SyncPushResultItemDto {
  @ApiProperty() clientUuid: string;
  @ApiProperty({ nullable: true }) id: string | undefined;
  @ApiProperty() status: string;
  @ApiProperty({ nullable: true }) error: string | undefined;
}

export class SyncPushResponseDto {
  @ApiProperty() processed: number;
  @ApiProperty() conflicts: number;
  @ApiProperty({ type: [SyncPushResultItemDto] })
  results: SyncPushResultItemDto[];
}
