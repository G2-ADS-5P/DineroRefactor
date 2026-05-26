import { OpenfinanceService } from "@openfinance/application/services/openfinance.service";
import { OpenfinanceMessagingService } from "@openfinance/application/services/openfinance-messaging.service";
import { SandboxDataService } from "@openfinance/application/services/sandbox-data.service";
import { PluggyApiService } from "@openfinance/infra/external/pluggy-api.service";
import { BANK_CONNECTION_REPOSITORY } from "@openfinance/domain/repositories/bank-connection-repository.interface";
import { ACCOUNT_REPOSITORY } from "@openfinance/domain/repositories/account-repository.interface";
import { BANK_STATEMENT_TRANSACTION_REPOSITORY } from "@openfinance/domain/repositories/bank-statement-transaction-repository.interface";
import { CARD_REPOSITORY } from "@openfinance/domain/repositories/card-repository.interface";
import { BankConnectionsController } from "@openfinance/infra/controllers/bank-connections.controller";
import { AccountsController } from "@openfinance/infra/controllers/accounts.controller";
import { PluggyWebhookController } from "@openfinance/infra/controllers/pluggy-webhook.controller";
import { DrizzleBankConnectionRepository } from "@openfinance/infra/repositories/drizzle-bank-connection.repository";
import { DrizzleAccountRepository } from "@openfinance/infra/repositories/drizzle-account.repository";
import { DrizzleBankStatementTransactionRepository } from "@openfinance/infra/repositories/drizzle-bank-statement-transaction.repository";
import { DrizzleCardRepository } from "@openfinance/infra/repositories/drizzle-card.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [BankConnectionsController, AccountsController, PluggyWebhookController],
  providers: [
    OpenfinanceMessagingService,
    SandboxDataService,
    PluggyApiService,
    OpenfinanceService,
    DrizzleBankConnectionRepository,
    DrizzleAccountRepository,
    DrizzleBankStatementTransactionRepository,
    DrizzleCardRepository,
    { provide: BANK_CONNECTION_REPOSITORY, useExisting: DrizzleBankConnectionRepository },
    { provide: ACCOUNT_REPOSITORY, useExisting: DrizzleAccountRepository },
    {
      provide: BANK_STATEMENT_TRANSACTION_REPOSITORY,
      useExisting: DrizzleBankStatementTransactionRepository,
    },
    { provide: CARD_REPOSITORY, useExisting: DrizzleCardRepository },
  ],
})
export class OpenfinanceModule {}
