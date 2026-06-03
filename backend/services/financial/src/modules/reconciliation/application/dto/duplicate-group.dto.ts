import { ApiProperty } from "@nestjs/swagger";
import type { TransactionResponseDto } from "@transactions/application/dto/transaction-response.dto";

export class DuplicateGroupDto {
  @ApiProperty() groupId: string;
  @ApiProperty({ type: [Object] }) transactions: TransactionResponseDto[];
}

export class DuplicatesResponseDto {
  @ApiProperty() totalGroups: number;
  @ApiProperty({ type: [DuplicateGroupDto] }) groups: DuplicateGroupDto[];
}
