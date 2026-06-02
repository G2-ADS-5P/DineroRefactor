import { BalanceService } from "@balance/application/services/balance.service";
import { BalanceController } from "@balance/infra/controllers/balance.controller";
import { Module } from "@nestjs/common";
import { TransactionsModule } from "@transactions/transactions.module";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [UsersModule, TransactionsModule],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
