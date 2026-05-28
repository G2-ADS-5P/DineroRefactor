import { ApiProperty } from "@nestjs/swagger";
import { PortfolioItemDto } from "@portfolio/application/dto/portfolio.dto";
import { PortfolioTransactionDto } from "@portfolio/application/dto/portfolio-transaction.dto";

export class PortfolioTransactionResultDto {
  @ApiProperty({ type: PortfolioTransactionDto })
  transaction: PortfolioTransactionDto;

  @ApiProperty({ type: PortfolioItemDto, nullable: true })
  position: PortfolioItemDto | null;

  constructor(
    transaction: PortfolioTransactionDto,
    position: PortfolioItemDto | null,
  ) {
    this.transaction = transaction;
    this.position = position;
  }
}
