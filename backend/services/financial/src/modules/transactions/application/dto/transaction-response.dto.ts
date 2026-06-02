import { ApiProperty } from "@nestjs/swagger";
import type { Transaction } from "@transactions/domain/models/transaction.entity";

export class TransactionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty({ nullable: true }) cardId: string | undefined;
  @ApiProperty({ nullable: true }) categoryId: string | undefined;
  @ApiProperty() amount: number;
  @ApiProperty() currency: string;
  @ApiProperty({ nullable: true }) amountBrl: number | undefined;
  @ApiProperty({ nullable: true }) exchangeRate: number | undefined;
  @ApiProperty() type: string;
  @ApiProperty() description: string;
  @ApiProperty() date: Date;
  @ApiProperty() isRecurring: boolean;
  @ApiProperty({ nullable: true }) recurringRule: string | undefined;
  @ApiProperty({ nullable: true }) notes: string | undefined;
  @ApiProperty({ nullable: true, type: [String] }) tags: string[] | undefined;
  @ApiProperty() createdAt: Date | undefined;
  @ApiProperty() updatedAt: Date | undefined;
  @ApiProperty({ nullable: true }) deletedAt: Date | undefined;

  private constructor(props: {
    id: string;
    userId: string;
    cardId: string | undefined;
    categoryId: string | undefined;
    amount: number;
    currency: string;
    amountBrl: number | undefined;
    exchangeRate: number | undefined;
    type: string;
    description: string;
    date: Date;
    isRecurring: boolean;
    recurringRule: string | undefined;
    notes: string | undefined;
    tags: string[] | undefined;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    deletedAt: Date | undefined;
  }) {
    Object.assign(this, props);
  }

  static from(transaction: Transaction | null): TransactionResponseDto | null {
    if (!transaction) return null;

    return new TransactionResponseDto({
      id: transaction.id!,
      userId: transaction.userId,
      cardId: transaction.cardId,
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      currency: transaction.currency,
      amountBrl: transaction.amountBrl,
      exchangeRate: transaction.exchangeRate,
      type: transaction.type,
      description: transaction.description,
      date: transaction.date,
      isRecurring: transaction.isRecurring,
      recurringRule: transaction.recurringRule,
      notes: transaction.notes,
      tags: transaction.tags,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      deletedAt: transaction.deletedAt,
    });
  }
}
