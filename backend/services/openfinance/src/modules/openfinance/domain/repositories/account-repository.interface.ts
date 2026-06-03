import type { Account } from "@openfinance/domain/models/account.entity";

export const ACCOUNT_REPOSITORY = Symbol("ACCOUNT_REPOSITORY");

export interface AccountRepository {
  createMany(accounts: Account[]): Promise<Account[]>;
  findAllByConnectionId(bankConnectionId: string): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
}
