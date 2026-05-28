import { Module } from "@nestjs/common";
import { ReconciliationService } from "@reconciliation/application/services/reconciliation.service";
import { ReconciliationController } from "@reconciliation/infra/controllers/reconciliation.controller";
import { TransactionsModule } from "@transactions/transactions.module";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [UsersModule, TransactionsModule],
  controllers: [ReconciliationController],
  providers: [ReconciliationService],
})
export class ReconciliationModule {}
