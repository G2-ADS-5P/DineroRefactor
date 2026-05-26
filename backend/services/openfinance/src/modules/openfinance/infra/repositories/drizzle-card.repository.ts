import { Card, type CardBrand } from "@openfinance/domain/models/card.entity";
import type { CardRepository } from "@openfinance/domain/repositories/card-repository.interface";
import { cardsSchema } from "@openfinance/infra/database/schemas/card.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleCardRepository implements CardRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createMany(cards: Card[]): Promise<Card[]> {
    if (cards.length === 0) return [];

    const rows = await this.drizzleService.db
      .insert(cardsSchema)
      .values(
        cards.map((c) => ({
          bankConnectionId: c.bankConnectionId,
          lastFourDigits: c.lastFourDigits,
          cardBrand: c.cardBrand,
          cardLimit: String(c.cardLimit),
          availableLimit: String(c.availableLimit),
          currentBill: String(c.currentBill),
          dueDay: c.dueDay,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      )
      .returning();

    return rows.map((row) => this.toEntity(row));
  }

  async findAllByConnectionId(bankConnectionId: string): Promise<Card[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(cardsSchema)
      .where(eq(cardsSchema.bankConnectionId, bankConnectionId));

    return rows.map((row) => this.toEntity(row));
  }

  private toEntity(row: typeof cardsSchema.$inferSelect): Card {
    return Card.restore({
      id: row.id,
      bankConnectionId: row.bankConnectionId,
      lastFourDigits: row.lastFourDigits,
      cardBrand: row.cardBrand as CardBrand,
      cardLimit: Number(row.cardLimit),
      availableLimit: Number(row.availableLimit),
      currentBill: Number(row.currentBill),
      dueDay: row.dueDay,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
