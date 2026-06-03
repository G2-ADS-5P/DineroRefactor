import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { Transaction } from "@transactions/domain/models/transaction.entity";
import type { TransactionRepository } from "@transactions/domain/repositories/transaction-repository.interface";
import { transactionsSchema } from "@transactions/infra/database/schemas/transaction.schema";
import { and, between, eq, gt, isNotNull, isNull, or, sql } from "drizzle-orm";

@Injectable()
export class DrizzleTransactionRepository implements TransactionRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  private notDeleted() {
    return isNull(transactionsSchema.deletedAt);
  }

  async create(transaction: Transaction): Promise<void> {
    await this.drizzleService.db.insert(transactionsSchema).values({
      userId: transaction.userId,
      cardId: transaction.cardId ?? null,
      categoryId: transaction.categoryId ?? null,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      amountBrl: transaction.amountBrl?.toString() ?? null,
      exchangeRate: transaction.exchangeRate?.toString() ?? null,
      type: transaction.type,
      description: transaction.description,
      date: transaction.date,
      isRecurring: transaction.isRecurring,
      recurringRule: transaction.recurringRule ?? null,
      notes: transaction.notes ?? null,
      tags: transaction.tags ?? null,
      clientUuid: transaction.clientUuid ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findByClientUuidAndUserId(
    clientUuid: string,
    userId: string,
  ): Promise<Transaction | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(transactionsSchema)
      .where(
        and(
          eq(transactionsSchema.clientUuid, clientUuid),
          eq(transactionsSchema.userId, userId),
          this.notDeleted(),
        ),
      )
      .limit(1);

    return this.toEntity(row);
  }

  async update(transaction: Transaction): Promise<void> {
    await this.drizzleService.db
      .update(transactionsSchema)
      .set({
        cardId: transaction.cardId ?? null,
        categoryId: transaction.categoryId ?? null,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        amountBrl: transaction.amountBrl?.toString() ?? null,
        exchangeRate: transaction.exchangeRate?.toString() ?? null,
        type: transaction.type,
        description: transaction.description,
        date: transaction.date,
        isRecurring: transaction.isRecurring,
        recurringRule: transaction.recurringRule ?? null,
        notes: transaction.notes ?? null,
        tags: transaction.tags ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(transactionsSchema.id, transaction.id!), this.notDeleted()),
      );
  }

  async softDelete(transaction: Transaction): Promise<void> {
    await this.drizzleService.db
      .update(transactionsSchema)
      .set({ deletedAt: transaction.deletedAt, updatedAt: new Date() })
      .where(
        and(eq(transactionsSchema.id, transaction.id!), this.notDeleted()),
      );
  }

  async findById(id: string): Promise<Transaction | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(transactionsSchema)
      .where(and(eq(transactionsSchema.id, id), this.notDeleted()))
      .limit(1);

    return this.toEntity(row);
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Transaction | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(transactionsSchema)
      .where(
        and(
          eq(transactionsSchema.id, id),
          eq(transactionsSchema.userId, userId),
          this.notDeleted(),
        ),
      )
      .limit(1);

    return this.toEntity(row);
  }

  async findAllByUserId(userId: string): Promise<Transaction[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(transactionsSchema)
      .where(and(eq(transactionsSchema.userId, userId), this.notDeleted()))
      .orderBy(transactionsSchema.date);

    return rows
      .map((r) => this.toEntity(r))
      .filter((t): t is Transaction => t !== null);
  }

  async findAllByUserIdSince(
    userId: string,
    since: Date,
  ): Promise<Transaction[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(transactionsSchema)
      .where(
        and(
          eq(transactionsSchema.userId, userId),
          gt(transactionsSchema.updatedAt, since),
        ),
      )
      .orderBy(transactionsSchema.updatedAt);

    return rows
      .map((r) => this.toEntity(r))
      .filter((t): t is Transaction => t !== null);
  }

  async findAllByUserIdForSync(
    userId: string,
    since?: Date,
  ): Promise<Transaction[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(transactionsSchema)
      .where(
        since
          ? and(
              eq(transactionsSchema.userId, userId),
              or(
                gt(transactionsSchema.updatedAt, since),
                and(
                  isNotNull(transactionsSchema.deletedAt),
                  gt(transactionsSchema.deletedAt, since),
                ),
              ),
            )
          : eq(transactionsSchema.userId, userId),
      )
      .orderBy(transactionsSchema.updatedAt);

    return rows
      .map((r) => this.toEntity(r))
      .filter((t): t is Transaction => t !== null);
  }

  async findAllByUserIdPaginated(
    userId: string,
    params: PaginationParams,
  ): Promise<{ rows: Transaction[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(transactionsSchema)
        .where(and(eq(transactionsSchema.userId, userId), this.notDeleted()))
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(transactionsSchema)
        .where(and(eq(transactionsSchema.userId, userId), this.notDeleted())),
    ]);

    return {
      rows: rows
        .map((r) => this.toEntity(r))
        .filter((t): t is Transaction => t !== null),
      total: countResult.count,
    };
  }

  async aggregateBalance(
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
  }> {
    const rows = await this.drizzleService.db
      .select()
      .from(transactionsSchema)
      .where(
        and(
          eq(transactionsSchema.userId, userId),
          this.notDeleted(),
          between(transactionsSchema.date, startDate, endDate),
        ),
      );

    const transactions = rows
      .map((r) => this.toEntity(r))
      .filter((t): t is Transaction => t !== null);

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategoryMap = new Map<
      string,
      { totalIncome: number; totalExpense: number }
    >();

    for (const tx of transactions) {
      const amount =
        tx.currency !== "BRL" ? (tx.amountBrl ?? tx.amount) : tx.amount;
      const key = tx.categoryId ?? "null";

      if (!byCategoryMap.has(key)) {
        byCategoryMap.set(key, { totalIncome: 0, totalExpense: 0 });
      }

      const cat = byCategoryMap.get(key)!;

      if (tx.type === "income") {
        totalIncome += amount;
        cat.totalIncome += amount;
      } else if (tx.type === "expense") {
        totalExpense += amount;
        cat.totalExpense += amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      byCategory: Array.from(byCategoryMap.entries()).map(([key, val]) => ({
        categoryId: key === "null" ? null : key,
        totalIncome: val.totalIncome,
        totalExpense: val.totalExpense,
      })),
    };
  }

  private toEntity(
    row?: typeof transactionsSchema.$inferSelect,
  ): Transaction | null {
    if (!row) return null;

    return Transaction.restore({
      id: row.id,
      userId: row.userId,
      cardId: row.cardId,
      categoryId: row.categoryId,
      amount: Number(row.amount),
      currency: row.currency,
      amountBrl: row.amountBrl != null ? Number(row.amountBrl) : null,
      exchangeRate: row.exchangeRate != null ? Number(row.exchangeRate) : null,
      type: row.type,
      description: row.description,
      date: row.date,
      isRecurring: row.isRecurring,
      recurringRule: row.recurringRule,
      notes: row.notes,
      tags: row.tags,
      clientUuid: row.clientUuid,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
