import type { Card } from "@cards/domain/models/card.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const CARD_REPOSITORY = Symbol("CARD_REPOSITORY");

export interface CardRepository {
  create(card: Card): Promise<void>;
  update(card: Card): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Card | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Card | null>;
  findAllByUserIdPaginated(
    userId: string,
    params: PaginationParams,
  ): Promise<{ rows: Card[]; total: number }>;
}
