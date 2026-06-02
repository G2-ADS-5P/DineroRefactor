import type { BankStatementTransaction } from "@openfinance/domain/models/bank-statement-transaction.entity";

export const BANK_STATEMENT_TRANSACTION_REPOSITORY = Symbol(
  "BANK_STATEMENT_TRANSACTION_REPOSITORY",
);

export interface BankStatementTransactionRepository {
  createMany(transactions: BankStatementTransaction[]): Promise<BankStatementTransaction[]>;
  findAllByAccountId(accountId: string): Promise<BankStatementTransaction[]>;
}
