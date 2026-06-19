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
  @IsString({ message: "ticker deve ser um texto." })
  @IsNotEmpty({ message: "ticker é obrigatório." })
  ticker!: string;

  @ApiProperty({ example: 10 })
  @IsInt({ message: "quantity deve ser um número inteiro." })
  @IsPositive({ message: "quantity deve ser maior que zero." })
  quantity!: number;

  @ApiProperty({ example: 32.5 })
  @IsNumber({}, { message: "averagePrice deve ser um número." })
  @IsPositive({ message: "averagePrice deve ser maior que zero." })
  averagePrice!: number;
}
