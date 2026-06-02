import { BalanceModule } from "@balance/balance.module";
import { CardsModule } from "@cards/cards.module";
import { CategoriesModule } from "@categories/categories.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ReconciliationModule } from "@reconciliation/reconciliation.module";
import { SharedModule } from "@shared/shared.module";
import { SyncModule } from "@sync/sync.module";
import { TransactionsModule } from "@transactions/transactions.module";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    UsersModule,
    CategoriesModule,
    CardsModule,
    TransactionsModule,
    BalanceModule,
    ReconciliationModule,
    SyncModule,
  ],
})
export class AppModule {}
