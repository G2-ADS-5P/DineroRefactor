import { Module } from "@nestjs/common";
import { SyncService } from "@sync/application/services/sync.service";
import { SYNC_LOG_REPOSITORY } from "@sync/domain/repositories/sync-log-repository.interface";
import { SyncController } from "@sync/infra/controllers/sync.controller";
import { DrizzleSyncLogRepository } from "@sync/infra/repositories/drizzle-sync-log.repository";
import { TransactionsModule } from "@transactions/transactions.module";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [UsersModule, TransactionsModule],
  controllers: [SyncController],
  providers: [
    SyncService,
    DrizzleSyncLogRepository,
    {
      provide: SYNC_LOG_REPOSITORY,
      useExisting: DrizzleSyncLogRepository,
    },
  ],
})
export class SyncModule {}
