import { ApiProperty } from "@nestjs/swagger";

export class AssetHistoryPointDto {
  @ApiProperty({ example: "2026-05-16" })
  date: string;

  @ApiProperty({ example: 38.42 })
  value: number;

  constructor(date: string, value: number) {
    this.date = date;
    this.value = value;
  }
}
