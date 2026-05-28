import { ApiProperty } from "@nestjs/swagger";
import { AssetHistoryPointDto } from "@portfolio/application/dto/asset-history.dto";
import { AssetMarketDto } from "@portfolio/application/dto/asset-market.dto";

export class AssetIndicatorsDto {
  @ApiProperty({ example: 0.98, nullable: true })
  pvp: number | null;

  @ApiProperty({ example: 13.2, nullable: true })
  dy: number | null;

  @ApiProperty({ example: 12400000, nullable: true })
  dailyLiquidity: number | null;

  @ApiProperty({ example: 9.87, nullable: true })
  averagePrice: number | null;

  constructor(props: {
    pvp: number | null;
    dy: number | null;
    dailyLiquidity: number | null;
    averagePrice: number | null;
  }) {
    this.pvp = props.pvp;
    this.dy = props.dy;
    this.dailyLiquidity = props.dailyLiquidity;
    this.averagePrice = props.averagePrice;
  }
}

export class AssetDetailDto extends AssetMarketDto {
  @ApiProperty({ type: AssetIndicatorsDto })
  indicators: AssetIndicatorsDto;

  @ApiProperty({
    example:
      "Fundo de investimento imobiliario com distribuicao mensal de dividendos.",
  })
  description: string;

  constructor(
    props: ConstructorParameters<typeof AssetMarketDto>[0] & {
      indicators: AssetIndicatorsDto;
      description: string;
      history: AssetHistoryPointDto[];
    },
  ) {
    super(props);
    this.indicators = props.indicators;
    this.description = props.description;
  }
}
