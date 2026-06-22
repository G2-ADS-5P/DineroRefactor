import { ApiProperty } from "@nestjs/swagger";
import {
  type AssetType,
  AssetTypes,
} from "@portfolio/domain/models/asset.entity";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class CreateAssetDto {
  @ApiProperty({ example: "PETR4" })
  @IsString({ message: "ticker deve ser um texto." })
  @IsNotEmpty({ message: "ticker é obrigatório." })
  ticker!: string;

  @ApiProperty({ example: "Petrobras PN" })
  @IsString({ message: "name deve ser um texto." })
  @IsNotEmpty({ message: "name é obrigatório." })
  name!: string;

  @ApiProperty({ enum: AssetTypes })
  @IsIn(AssetTypes, { message: "type informado não é válido." })
  type!: AssetType;
}
