import { ApiProperty } from "@nestjs/swagger";

class PeriodDto {
  @ApiProperty() startDate: Date;
  @ApiProperty() endDate: Date;
}

class ByCategoryDto {
  @ApiProperty({ nullable: true }) categoryId: string | null;
  @ApiProperty() totalIncome: number;
  @ApiProperty() totalExpense: number;
}

class ByTypeDto {
  @ApiProperty() income: number;
  @ApiProperty() expense: number;
}

export class BalanceSummaryDto {
  @ApiProperty() totalIncome: number;
  @ApiProperty() totalExpense: number;
  @ApiProperty() netBalance: number;
  @ApiProperty() period: PeriodDto;
  @ApiProperty({ type: [ByCategoryDto] }) byCategory: ByCategoryDto[];
  @ApiProperty() byType: ByTypeDto;
}
