import { AccountDto } from "@openfinance/application/dto/account.dto";
import { BankConnectionDto } from "@openfinance/application/dto/bank-connection.dto";
import { BankStatementTransactionDto } from "@openfinance/application/dto/bank-statement-transaction.dto";
import { CardDto } from "@openfinance/application/dto/card.dto";
import { CreateBankConnectionResponseDto } from "@openfinance/application/dto/create-bank-connection-response.dto";
import type { PaginatedResult } from "@shared/infra/hateoas";
import { OpenfinanceMessagingService } from "@openfinance/application/services/openfinance-messaging.service";
import { SandboxDataService } from "@openfinance/application/services/sandbox-data.service";
import {
  BankConnection,
  BankConnectionStatus,
} from "@openfinance/domain/models/bank-connection.entity";
import { Account, AccountType } from "@openfinance/domain/models/account.entity";
import {
  BankStatementTransaction,
  BankTransactionType,
} from "@openfinance/domain/models/bank-statement-transaction.entity";
import { Card, type CardBrand } from "@openfinance/domain/models/card.entity";
import {
  BANK_CONNECTION_REPOSITORY,
  type BankConnectionRepository,
} from "@openfinance/domain/repositories/bank-connection-repository.interface";
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from "@openfinance/domain/repositories/account-repository.interface";
import {
  BANK_STATEMENT_TRANSACTION_REPOSITORY,
  type BankStatementTransactionRepository,
} from "@openfinance/domain/repositories/bank-statement-transaction-repository.interface";
import {
  CARD_REPOSITORY,
  type CardRepository,
} from "@openfinance/domain/repositories/card-repository.interface";
import { PluggyApiService } from "@openfinance/infra/external/pluggy-api.service";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";

@Injectable()
export class OpenfinanceService {
  constructor(
    @Inject(BANK_CONNECTION_REPOSITORY)
    private readonly bankConnectionRepository: BankConnectionRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    @Inject(BANK_STATEMENT_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: BankStatementTransactionRepository,
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: CardRepository,
    private readonly openfinanceMessagingService: OpenfinanceMessagingService,
    private readonly sandboxDataService: SandboxDataService,
    private readonly pluggyApiService: PluggyApiService,
    private readonly configService: ConfigService,
  ) {}

  async initiateBankConnection(dto: {
    userId: string;
    bankName: string;
    institutionId?: string;
  }): Promise<CreateBankConnectionResponseDto> {
    const consentId = randomUUID();

    const bankConnection = BankConnection.restore({
      userId: dto.userId,
      bankName: dto.bankName,
      consentId,
      status: BankConnectionStatus.PENDING_CONSENT,
      connectedAt: new Date(),
    });

    const created = await this.bankConnectionRepository.create(bankConnection);

    if (this.pluggyApiService.isConfigured()) {
      // Pass connectionId as clientUserId so the webhook can map back to this connection
      const connectToken = await this.pluggyApiService.getConnectToken({
        clientUserId: created.id,
      });
      return new CreateBankConnectionResponseDto({
        id: created.id,
        bankName: created.bankName,
        status: created.status,
        connectToken,
      });
    }

    const port = this.configService.get<string>("PORT") ?? "4006";
    const institutionParam = dto.institutionId ? `&institutionId=${dto.institutionId}` : "";
    const consentUrl =
      `https://sandbox.openfinance.example.com/consent/${consentId}` +
      `?redirect_uri=http://localhost:${port}/v1/bank-connections/${created.id}/authorize${institutionParam}`;

    return new CreateBankConnectionResponseDto({
      id: created.id,
      bankName: created.bankName,
      status: created.status,
      consentUrl,
    });
  }

  async authorizeConnection(
    id: string,
    userId: string,
    itemId?: string,
    institutionId?: string,
  ): Promise<BankConnectionDto> {
    const bankConnection = await this.bankConnectionRepository.findById(id);

    if (!bankConnection || bankConnection.userId !== userId) {
      throw new NotFoundException("Bank connection not found");
    }

    if (bankConnection.status !== BankConnectionStatus.PENDING_CONSENT) {
      throw new BadRequestException("Bank connection is not awaiting consent");
    }

    if (this.pluggyApiService.isConfigured()) {
      if (!itemId) {
        throw new BadRequestException(
          "itemId is required when Pluggy is configured. " +
          "Get it from the Pluggy Connect widget onSuccess callback.",
        );
      }
      await this.bankConnectionRepository.activate(id, itemId);
      await this.syncPluggyData(id, itemId);
    } else {
      await this.bankConnectionRepository.activate(id);
      await this.sandboxDataService.generateForConnection(id, institutionId);
    }

    bankConnection.withStatus(BankConnectionStatus.ACTIVE);
    const responseDto = BankConnectionDto.from(bankConnection)!;
    await this.openfinanceMessagingService.publishBankConnectionCreated(responseDto);

    return responseDto;
  }

  private async syncPluggyData(connectionId: string, itemId: string): Promise<void> {
    const pluggyAccounts = await this.pluggyApiService.getAccounts(itemId);

    const bankAccounts = pluggyAccounts.filter((a) => a.type === "BANK");
    const creditAccounts = pluggyAccounts.filter((a) => a.type === "CREDIT");

    if (bankAccounts.length > 0) {
      const accounts = bankAccounts.map((a) =>
        Account.restore({
          bankConnectionId: connectionId,
          externalId: a.id,
          accountType:
            a.subtype === "SAVINGS_ACCOUNT"
              ? AccountType.SAVINGS
              : AccountType.CHECKING,
          accountNumber: a.number,
          balance: a.balance,
          currency: a.currencyCode,
        }),
      );

      const created = await this.accountRepository.createMany(accounts);

      for (const account of created) {
        if (!account.id) continue;
        const pluggyTxs = await this.pluggyApiService.getTransactions(
          account.externalId,
        );

        const transactions = pluggyTxs.map((t) =>
          BankStatementTransaction.restore({
            accountId: account.id!,
            description: t.description,
            amount: Math.abs(t.amount),
            type:
              t.type === "CREDIT"
                ? BankTransactionType.CREDIT
                : BankTransactionType.DEBIT,
            category: t.category ?? null,
            transactionDate: new Date(t.date),
          }),
        );

        await this.transactionRepository.createMany(transactions);
      }
    }

    if (creditAccounts.length > 0) {
      const cards = creditAccounts.map((a) => {
        const credit = a.creditData;
        const limit = credit?.creditLimit ?? 0;
        const available = credit?.availableCreditLimit ?? 0;

        return Card.restore({
          bankConnectionId: connectionId,
          lastFourDigits: a.number.slice(-4),
          cardBrand: (credit?.brand ?? "Visa") as CardBrand,
          cardLimit: limit,
          availableLimit: available,
          currentBill: Math.max(0, limit - available),
          dueDay: credit?.balanceDueDate
            ? new Date(credit.balanceDueDate).getDate().toString()
            : "10",
        });
      });

      await this.cardRepository.createMany(cards);
    }
  }

  async listBankConnections(userId: string): Promise<PaginatedResult<BankConnectionDto>> {
    const connections =
      await this.bankConnectionRepository.findAllByUserId(userId);
    const data = connections.map((c) => BankConnectionDto.from(c)!);
    return { data, total: data.length, page: 1, limit: data.length || 1 };
  }

  async revokeBankConnection(id: string, userId: string): Promise<void> {
    const bankConnection = await this.bankConnectionRepository.findById(id);

    if (!bankConnection || bankConnection.userId !== userId) {
      throw new NotFoundException("Bank connection not found");
    }

    if (bankConnection.status === BankConnectionStatus.REVOKED) {
      throw new BadRequestException("Bank connection is already revoked");
    }

    await this.bankConnectionRepository.revoke(id);
    bankConnection.withStatus(BankConnectionStatus.REVOKED);
    bankConnection.withRevokedAt(new Date());

    await this.openfinanceMessagingService.publishBankConnectionRevoked(
      BankConnectionDto.from(bankConnection)!,
    );
  }

  async getAccountsByConnection(
    connectionId: string,
    userId: string,
  ): Promise<PaginatedResult<AccountDto>> {
    const connection =
      await this.bankConnectionRepository.findById(connectionId);

    if (!connection || connection.userId !== userId) {
      throw new NotFoundException("Bank connection not found");
    }

    const accounts =
      await this.accountRepository.findAllByConnectionId(connectionId);
    const data = accounts.map((a) => AccountDto.from(a)!);
    return { data, total: data.length, page: 1, limit: data.length || 1 };
  }

  async getTransactionsByAccount(
    accountId: string,
    userId: string,
  ): Promise<PaginatedResult<BankStatementTransactionDto>> {
    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      throw new NotFoundException("Account not found");
    }

    const connection = await this.bankConnectionRepository.findById(
      account.bankConnectionId,
    );

    if (!connection || connection.userId !== userId) {
      throw new NotFoundException("Account not found");
    }

    const transactions =
      await this.transactionRepository.findAllByAccountId(accountId);
    const data = transactions.map((t) => BankStatementTransactionDto.from(t)!);
    return { data, total: data.length, page: 1, limit: data.length || 1 };
  }

  // Called by the Pluggy webhook when item/created or item/updated arrives
  async syncByConnectionId(connectionId: string, itemId: string): Promise<void> {
    const connection = await this.bankConnectionRepository.findById(connectionId);
    if (!connection) return;

    if (connection.status === BankConnectionStatus.PENDING_CONSENT) {
      await this.bankConnectionRepository.activate(connectionId, itemId);
      connection.withStatus(BankConnectionStatus.ACTIVE);
      await this.openfinanceMessagingService.publishBankConnectionCreated(
        BankConnectionDto.from(connection)!,
      );
    }

    await this.syncPluggyData(connectionId, itemId);
  }

  async getCardsByConnection(
    connectionId: string,
    userId: string,
  ): Promise<PaginatedResult<CardDto>> {
    const connection =
      await this.bankConnectionRepository.findById(connectionId);

    if (!connection || connection.userId !== userId) {
      throw new NotFoundException("Bank connection not found");
    }

    const cards =
      await this.cardRepository.findAllByConnectionId(connectionId);
    const data = cards.map((c) => CardDto.from(c)!);
    return { data, total: data.length, page: 1, limit: data.length || 1 };
  }
}
