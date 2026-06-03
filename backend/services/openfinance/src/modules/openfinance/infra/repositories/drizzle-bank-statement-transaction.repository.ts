import {
  BankStatementTransaction,
  BankTransactionType,
} from "@openfinance/domain/models/bank-statement-transaction.entity";
import type { BankStatementTransactionRepository } from "@openfinance/domain/repositories/bank-statement-transaction-repository.interface";
import { bankStatementTransactionsSchema } from "@openfinance/infra/database/schemas/bank-statement-transaction.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq, desc } from "drizzle-orm";

@Injectable()
export class DrizzleBankStatementTransactionRepository
  implements BankStatementTransactionRepository
{
  constructor(private readonly drizzleService: DrizzleService) {}

  async createMany(
    transactions: BankStatementTransaction[],
  ): Promise<BankStatementTransaction[]> {
    if (transactions.length === 0) return [];

    const rows = await this.drizzleService.db
      .insert(bankStatementTransactionsSchema)
      .values(
        transactions.map((t) => ({
          accountId: t.accountId,
          description: t.description,
          amount: String(t.amount),
          type: t.type,
          category: t.category ?? null,
          transactionDate: t.transactionDate,
          createdAt: new Date(),
        })),
      )
      .returning();

    return rows.map((row) => this.toEntity(row));
  }

  async findAllByAccountId(
    accountId: string,
  ): Promise<BankStatementTransaction[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(bankStatementTransactionsSchema)
      .where(eq(bankStatementTransactionsSchema.accountId, accountId))
      .orderBy(desc(bankStatementTransactionsSchema.transactionDate));

    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(
    row: typeof bankStatementTransactionsSchema.$inferSelect,
  ): BankStatementTransaction {
    return BankStatementTransaction.restore({
      id: row.id,
      accountId: row.accountId,
      description: row.description,
      amount: Number(row.amount),
      type: row.type as BankTransactionType,
      category: row.category,
      transactionDate: row.transactionDate,
      createdAt: row.createdAt,
    });
  }
}
