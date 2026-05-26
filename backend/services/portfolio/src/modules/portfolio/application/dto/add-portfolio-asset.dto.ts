import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from "class-validator";

export class AddPortfolioAssetDto {
  @ApiProperty({ example: "PETR4" })
  @IsString()
  @IsNotEmpty()
  ticker!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ example: 32.5 })
  @IsNumber()
  @IsPositive()
  averagePrice!: number;
}
