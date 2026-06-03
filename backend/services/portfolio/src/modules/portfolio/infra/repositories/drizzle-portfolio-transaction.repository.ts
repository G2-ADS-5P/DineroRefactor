import { Injectable } from "@nestjs/common";
import {
  PortfolioTransaction,
  type PortfolioTransactionType,
} from "@portfolio/domain/models/portfolio-transaction.entity";
import type { PortfolioTransactionRepository } from "@portfolio/domain/repositories/portfolio-transaction-repository.interface";
import { portfolioTransactionsSchema } from "@portfolio/infra/database/schemas/portfolio-transaction.schema";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { desc, eq } from "drizzle-orm";

@Injectable()
export class DrizzlePortfolioTransactionRepository
  implements PortfolioTransactionRepository
{
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(
    transaction: PortfolioTransaction,
  ): Promise<PortfolioTransaction> {
    const [row] = await this.drizzleService.db
      .insert(portfolioTransactionsSchema)
      .values({
        userId: transaction.userId,
        assetId: transaction.assetId,
        type: transaction.type,
        operationDate: transaction.operationDate,
        quantity: transaction.quantity,
        unitPrice: transaction.unitPrice,
        costs: transaction.costs,
        totalValue: transaction.totalValue,
        createdAt: transaction.createdAt ?? new Date(),
      })
      .returning();

    return this.toDomain(row);
  }

  async findAllByUserId(userId: string): Promise<PortfolioTransaction[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(portfolioTransactionsSchema)
      .where(eq(portfolioTransactionsSchema.userId, userId))
      .orderBy(desc(portfolioTransactionsSchema.operationDate));

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(
    row: typeof portfolioTransactionsSchema.$inferSelect,
  ): PortfolioTransaction {
    return PortfolioTransaction.restore({
      ...row,
      type: row.type as PortfolioTransactionType,
    })!;
  }
}
