import type { Card } from "@cards/domain/models/card.entity";
import { ApiProperty } from "@nestjs/swagger";

export class CardResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() name: string;
  @ApiProperty() brand: string;
  @ApiProperty() lastDigits: string;
  @ApiProperty() currentBill: number;
  @ApiProperty() creditLimit: number;
  @ApiProperty() dueDay: number;
  @ApiProperty() createdAt: Date | undefined;
  @ApiProperty() updatedAt: Date | undefined;

  private constructor(
    id: string,
    userId: string,
    name: string,
    brand: string,
    lastDigits: string,
    currentBill: number,
    creditLimit: number,
    dueDay: number,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.brand = brand;
    this.lastDigits = lastDigits;
    this.currentBill = currentBill;
    this.creditLimit = creditLimit;
    this.dueDay = dueDay;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(card: Card | null): CardResponseDto | null {
    if (!card) return null;

    return new CardResponseDto(
      card.id!,
      card.userId,
      card.name,
      card.brand,
      card.lastDigits,
      card.currentBill,
      card.creditLimit,
      card.dueDay,
      card.createdAt,
      card.updatedAt,
    );
  }
}
