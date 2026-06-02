import type { BankStatementTransaction } from "@openfinance/domain/models/bank-statement-transaction.entity";
import { ApiProperty } from "@nestjs/swagger";

export class BankStatementTransactionDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid-da-conta" })
  accountId: string;

  @ApiProperty({ example: "Compra no débito - Supermercado Extra" })
  description: string;

  @ApiProperty({ example: 152.9 })
  amount: number;

  @ApiProperty({ example: "debit", enum: ["debit", "credit"] })
  type: string;

  @ApiProperty({ example: "Alimentação", nullable: true })
  category: string | null | undefined;

  @ApiProperty()
  transactionDate: Date;

  private constructor(
    id: string | undefined,
    accountId: string,
    description: string,
    amount: number,
    type: string,
    category: string | null | undefined,
    transactionDate: Date,
  ) {
    this.id = id;
    this.accountId = accountId;
    this.description = description;
    this.amount = amount;
    this.type = type;
    this.category = category;
    this.transactionDate = transactionDate;
  }

  static from(
    transaction: BankStatementTransaction | null,
  ): BankStatementTransactionDto | null {
    if (!transaction) return null;
    return new BankStatementTransactionDto(
      transaction.id,
      transaction.accountId,
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.transactionDate,
    );
  }
}
