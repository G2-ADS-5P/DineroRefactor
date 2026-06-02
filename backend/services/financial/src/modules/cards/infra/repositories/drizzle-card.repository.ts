import { Card } from "@cards/domain/models/card.entity";
import type { CardRepository } from "@cards/domain/repositories/card-repository.interface";
import { cardsSchema } from "@cards/infra/database/schemas/card.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { and, eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleCardRepository implements CardRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(card: Card): Promise<void> {
    await this.drizzleService.db.insert(cardsSchema).values({
      userId: card.userId,
      name: card.name,
      brand: card.brand,
      lastDigits: card.lastDigits,
      currentBill: card.currentBill.toString(),
      creditLimit: card.creditLimit.toString(),
      dueDay: card.dueDay,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(card: Card): Promise<void> {
    await this.drizzleService.db
      .update(cardsSchema)
      .set({
        name: card.name,
        brand: card.brand,
        currentBill: card.currentBill.toString(),
        creditLimit: card.creditLimit.toString(),
        dueDay: card.dueDay,
        updatedAt: new Date(),
      })
      .where(eq(cardsSchema.id, card.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(cardsSchema)
      .where(eq(cardsSchema.id, id));
  }

  async findById(id: string): Promise<Card | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(cardsSchema)
      .where(eq(cardsSchema.id, id))
      .limit(1);

    return this.toEntity(row);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Card | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(cardsSchema)
      .where(and(eq(cardsSchema.id, id), eq(cardsSchema.userId, userId)))
      .limit(1);

    return this.toEntity(row);
  }

  async findAllByUserIdPaginated(
    userId: string,
    params: PaginationParams,
  ): Promise<{ rows: Card[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(cardsSchema)
        .where(eq(cardsSchema.userId, userId))
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(cardsSchema)
        .where(eq(cardsSchema.userId, userId)),
    ]);

    return {
      rows: rows
        .map((r) => this.toEntity(r))
        .filter((c): c is Card => c !== null),
      total: countResult.count,
    };
  }

  private toEntity(row?: typeof cardsSchema.$inferSelect): Card | null {
    if (!row) return null;

    return Card.restore({
      id: row.id,
      userId: row.userId,
      name: row.name,
      brand: row.brand,
      lastDigits: row.lastDigits,
      currentBill: Number(row.currentBill),
      creditLimit: Number(row.creditLimit),
      dueDay: row.dueDay,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
