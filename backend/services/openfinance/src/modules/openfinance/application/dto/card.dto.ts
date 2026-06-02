import type { Card } from "@openfinance/domain/models/card.entity";
import { ApiProperty } from "@nestjs/swagger";

export class CardDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid-da-conexao" })
  bankConnectionId: string;

  @ApiProperty({ example: "4321" })
  lastFourDigits: string;

  @ApiProperty({ example: "Visa", enum: ["Visa", "Mastercard", "Elo", "Hipercard"] })
  cardBrand: string;

  @ApiProperty({ example: 5000.0 })
  cardLimit: number;

  @ApiProperty({ example: 3248.5 })
  availableLimit: number;

  @ApiProperty({ example: 1751.5 })
  currentBill: number;

  @ApiProperty({ example: "10", description: "Dia de vencimento da fatura" })
  dueDay: string;

  private constructor(
    id: string | undefined,
    bankConnectionId: string,
    lastFourDigits: string,
    cardBrand: string,
    cardLimit: number,
    availableLimit: number,
    currentBill: number,
    dueDay: string,
  ) {
    this.id = id;
    this.bankConnectionId = bankConnectionId;
    this.lastFourDigits = lastFourDigits;
    this.cardBrand = cardBrand;
    this.cardLimit = cardLimit;
    this.availableLimit = availableLimit;
    this.currentBill = currentBill;
    this.dueDay = dueDay;
  }

  static from(card: Card | null): CardDto | null {
    if (!card) return null;
    return new CardDto(
      card.id,
      card.bankConnectionId,
      card.lastFourDigits,
      card.cardBrand,
      card.cardLimit,
      card.availableLimit,
      card.currentBill,
      card.dueDay,
    );
  }
}
