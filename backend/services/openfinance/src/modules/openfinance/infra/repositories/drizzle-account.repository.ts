import {
  Account,
  AccountType,
} from "@openfinance/domain/models/account.entity";
import type { AccountRepository } from "@openfinance/domain/repositories/account-repository.interface";
import { accountsSchema } from "@openfinance/infra/database/schemas/account.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleAccountRepository implements AccountRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createMany(accounts: Account[]): Promise<Account[]> {
    if (accounts.length === 0) return [];

    const rows = await this.drizzleService.db
      .insert(accountsSchema)
      .values(
        accounts.map((a) => ({
          bankConnectionId: a.bankConnectionId,
          externalId: a.externalId,
          accountType: a.accountType,
          accountNumber: a.accountNumber,
          balance: String(a.balance),
          currency: a.currency,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      )
      .returning();

    return rows.map((row) => this.toEntity(row));
  }

  async findAllByConnectionId(bankConnectionId: string): Promise<Account[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(accountsSchema)
      .where(eq(accountsSchema.bankConnectionId, bankConnectionId));

    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<Account | null> {
    const result = await this.drizzleService.db
      .select()
      .from(accountsSchema)
      .where(eq(accountsSchema.id, id))
      .limit(1);

    if (!result[0]) return null;
    return this.toEntity(result[0]);
  }

  private toEntity(row: typeof accountsSchema.$inferSelect): Account {
    return Account.restore({
      id: row.id,
      bankConnectionId: row.bankConnectionId,
      externalId: row.externalId,
      accountType: row.accountType as AccountType,
      accountNumber: row.accountNumber,
      balance: Number(row.balance),
      currency: row.currency,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
