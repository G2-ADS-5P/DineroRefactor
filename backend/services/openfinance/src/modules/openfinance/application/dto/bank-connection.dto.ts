import type { BankConnection } from "@openfinance/domain/models/bank-connection.entity";
import { ApiProperty } from "@nestjs/swagger";

export class BankConnectionDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid-do-usuario" })
  userId: string;

  @ApiProperty({ example: "Banco do Brasil" })
  bankName: string;

  @ApiProperty({ example: "consent-uuid" })
  consentId: string;

  @ApiProperty({ example: "active" })
  status: string;

  @ApiProperty()
  connectedAt: Date;

  @ApiProperty({ nullable: true })
  revokedAt: Date | null | undefined;

  private constructor(
    id: string | undefined,
    userId: string,
    bankName: string,
    consentId: string,
    status: string,
    connectedAt: Date,
    revokedAt: Date | null | undefined,
  ) {
    this.id = id;
    this.userId = userId;
    this.bankName = bankName;
    this.consentId = consentId;
    this.status = status;
    this.connectedAt = connectedAt;
    this.revokedAt = revokedAt;
  }

  static from(bankConnection: BankConnection | null): BankConnectionDto | null {
    if (!bankConnection) return null;
    return new BankConnectionDto(
      bankConnection.id,
      bankConnection.userId,
      bankConnection.bankName,
      bankConnection.consentId,
      bankConnection.status,
      bankConnection.connectedAt,
      bankConnection.revokedAt,
    );
  }
}
