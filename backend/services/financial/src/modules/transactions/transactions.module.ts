import { Module } from "@nestjs/common";
import { TransactionService } from "@transactions/application/services/transaction.service";
import { TransactionMessagingService } from "@transactions/application/services/transaction-messaging.service";
import { TRANSACTION_REPOSITORY } from "@transactions/domain/repositories/transaction-repository.interface";
import { TransactionsController } from "@transactions/infra/controllers/transactions.controller";
import { DrizzleTransactionRepository } from "@transactions/infra/repositories/drizzle-transaction.repository";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [TransactionsController],
  providers: [
    TransactionService,
    TransactionMessagingService,
    DrizzleTransactionRepository,
    {
      provide: TRANSACTION_REPOSITORY,
      useExisting: DrizzleTransactionRepository,
    },
  ],
  exports: [TransactionService],
})
export class TransactionsModule {}
