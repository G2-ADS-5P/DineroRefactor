import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateCardDto {
  @ApiProperty({ example: "Nubank Roxinho", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: "Mastercard", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  creditLimit?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  currentBill?: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 31, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;
}
