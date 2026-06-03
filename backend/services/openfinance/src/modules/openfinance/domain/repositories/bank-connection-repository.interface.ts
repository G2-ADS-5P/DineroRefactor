import type { BankConnection } from "@openfinance/domain/models/bank-connection.entity";

export const BANK_CONNECTION_REPOSITORY = Symbol("BANK_CONNECTION_REPOSITORY");

export interface BankConnectionRepository {
  create(bankConnection: BankConnection): Promise<BankConnection>;
  findById(id: string): Promise<BankConnection | null>;
  findAllByUserId(userId: string): Promise<BankConnection[]>;
  activate(id: string, pluggyItemId?: string): Promise<void>;
  revoke(id: string): Promise<void>;
}
