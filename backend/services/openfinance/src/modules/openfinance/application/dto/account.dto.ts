import type { Account } from "@openfinance/domain/models/account.entity";
import { ApiProperty } from "@nestjs/swagger";

export class AccountDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid-da-conexao" })
  bankConnectionId: string;

  @ApiProperty({ example: "checking", enum: ["checking", "savings"] })
  accountType: string;

  @ApiProperty({ example: "****1234" })
  accountNumber: string;

  @ApiProperty({ example: 4250.75 })
  balance: number;

  @ApiProperty({ example: "BRL" })
  currency: string;

  private constructor(
    id: string | undefined,
    bankConnectionId: string,
    accountType: string,
    accountNumber: string,
    balance: number,
    currency: string,
  ) {
    this.id = id;
    this.bankConnectionId = bankConnectionId;
    this.accountType = accountType;
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.currency = currency;
  }

  static from(account: Account | null): AccountDto | null {
    if (!account) return null;
    return new AccountDto(
      account.id,
      account.bankConnectionId,
      account.accountType,
      account.accountNumber,
      account.balance,
      account.currency,
    );
  }
}
