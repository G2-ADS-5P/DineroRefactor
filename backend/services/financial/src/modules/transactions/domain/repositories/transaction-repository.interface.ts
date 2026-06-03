import type { PaginationParams } from "@shared/infra/hateoas";
import type { Transaction } from "@transactions/domain/models/transaction.entity";

export const TRANSACTION_REPOSITORY = Symbol("TRANSACTION_REPOSITORY");

export interface TransactionRepository {
  create(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  softDelete(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Transaction | null>;
  findByClientUuidAndUserId(
    clientUuid: string,
    userId: string,
  ): Promise<Transaction | null>;
  findAllByUserId(userId: string): Promise<Transaction[]>;
  findAllByUserIdSince(userId: string, since: Date): Promise<Transaction[]>;
  findAllByUserIdForSync(userId: string, since?: Date): Promise<Transaction[]>;
  findAllByUserIdPaginated(
    userId: string,
    params: PaginationParams,
  ): Promise<{ rows: Transaction[]; total: number }>;
  aggregateBalance(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    byCategory: Array<{
      categoryId: string | null;
      totalIncome: number;
      totalExpense: number;
    }>;
  }>;
}
