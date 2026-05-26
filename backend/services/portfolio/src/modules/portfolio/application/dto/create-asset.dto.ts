import { ApiProperty } from "@nestjs/swagger";
import {
  type AssetType,
  AssetTypes,
} from "@portfolio/domain/models/asset.entity";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class CreateAssetDto {
  @ApiProperty({ example: "PETR4" })
  @IsString()
  @IsNotEmpty()
  ticker!: string;

  @ApiProperty({ example: "Petrobras PN" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: AssetTypes })
  @IsIn(AssetTypes)
  type!: AssetType;
}
