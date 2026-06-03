import type { Card } from "@openfinance/domain/models/card.entity";

export const CARD_REPOSITORY = Symbol("CARD_REPOSITORY");

export interface CardRepository {
  createMany(cards: Card[]): Promise<Card[]>;
  findAllByConnectionId(bankConnectionId: string): Promise<Card[]>;
}
