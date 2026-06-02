import { ApiProperty } from "@nestjs/swagger";
import type { Asset } from "@portfolio/domain/models/asset.entity";

export class AssetDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "PETR4" })
  ticker: string;

  @ApiProperty({ example: "Petrobras PN" })
  name: string;

  @ApiProperty({ example: "ACAO" })
  type: string;

  constructor(
    id: string | undefined,
    ticker: string,
    name: string,
    type: string,
  ) {
    this.id = id;
    this.ticker = ticker;
    this.name = name;
    this.type = type;
  }

  public static from(asset: Asset | null): AssetDto | null {
    if (!asset) return null;
    return new AssetDto(asset.id, asset.ticker, asset.name, asset.type);
  }
}
