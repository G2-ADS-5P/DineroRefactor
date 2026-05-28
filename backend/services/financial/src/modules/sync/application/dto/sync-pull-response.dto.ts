import { ApiProperty } from "@nestjs/swagger";
import type { TransactionResponseDto } from "@transactions/application/dto/transaction-response.dto";

export class SyncPullResponseDto {
  @ApiProperty({ type: [Object] }) transactions: TransactionResponseDto[];
  @ApiProperty() pulledAt: Date;
}
