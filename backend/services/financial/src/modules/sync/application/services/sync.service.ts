import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { SyncPullResponseDto } from "@sync/application/dto/sync-pull-response.dto";
import type {
  SyncPushDto,
  SyncPushResponseDto,
  SyncPushResultItemDto,
} from "@sync/application/dto/sync-push.dto";
import { SyncStatusDto } from "@sync/application/dto/sync-status.dto";
import { SyncLog } from "@sync/domain/models/sync-log.entity";
import {
  SYNC_LOG_REPOSITORY,
  type SyncLogRepository,
} from "@sync/domain/repositories/sync-log-repository.interface";
import { TransactionService } from "@transactions/application/services/transaction.service";
import { UserService } from "@users/application/services/user.service";

@Injectable()
export class SyncService {
  constructor(
    @Inject(SYNC_LOG_REPOSITORY)
    private readonly syncLogRepository: SyncLogRepository,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {}

  async push(
    externalUserId: string,
    dto: SyncPushDto,
  ): Promise<SyncPushResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const startedAt = new Date();

    const runningLog = await this.syncLogRepository.create(
      SyncLog.restore({
        userId: localUser.id!,
        direction: "PUSH",
        status: "running",
        itemsCount: dto.items.length,
        startedAt,
      })!,
    );

    let processed = 0;
    let conflicts = 0;
    const results: SyncPushResultItemDto[] = [];

    try {
      for (const item of dto.items) {
        try {
          if (item.operation === "CREATE") {
            if (
              !item.amount ||
              !item.currency ||
              !item.type ||
              !item.description ||
              !item.date
            ) {
              throw new BadRequestException(
                `CREATE item (clientUuid: ${item.clientUuid}) is missing required transaction fields`,
              );
            }
            const created = await this.transactionService.create(
              externalUserId,
              {
                amount: item.amount,
                currency: item.currency,
                amountBrl: item.amountBrl,
                exchangeRate: item.exchangeRate,
                type: item.type,
                description: item.description,
                date: item.date,
                cardId: item.cardId,
                categoryId: item.categoryId,
                isRecurring: item.isRecurring,
                recurringRule: item.recurringRule,
                notes: item.notes,
                tags: item.tags,
                clientUuid: item.clientUuid,
              },
            );
            processed++;
            results.push({
              clientUuid: item.clientUuid,
              id: created.id,
              status: "ok",
              error: undefined,
            });
          } else if (item.operation === "UPDATE") {
            if (!item.id) {
              conflicts++;
              results.push({
                clientUuid: item.clientUuid,
                id: undefined,
                status: "conflict",
                error: "id is required for UPDATE",
              });
              continue;
            }
            const updated = await this.transactionService.update(
              externalUserId,
              item.id,
              {
                amount: item.amount,
                currency: item.currency,
                amountBrl: item.amountBrl,
                exchangeRate: item.exchangeRate,
                type: item.type,
                description: item.description,
                date: item.date,
                cardId: item.cardId,
                categoryId: item.categoryId,
                isRecurring: item.isRecurring,
                recurringRule: item.recurringRule,
                notes: item.notes,
                tags: item.tags,
              },
            );
            processed++;
            results.push({
              clientUuid: item.clientUuid,
              id: updated.id,
              status: "ok",
              error: undefined,
            });
          } else if (item.operation === "DELETE") {
            if (!item.id) {
              conflicts++;
              results.push({
                clientUuid: item.clientUuid,
                id: undefined,
                status: "conflict",
                error: "id is required for DELETE",
              });
              continue;
            }
            await this.transactionService.remove(externalUserId, item.id);
            processed++;
            results.push({
              clientUuid: item.clientUuid,
              id: item.id,
              status: "ok",
              error: undefined,
            });
          }
        } catch (itemError) {
          conflicts++;
          results.push({
            clientUuid: item.clientUuid,
            id: item.id,
            status: "failed",
            error:
              itemError instanceof Error ? itemError.message : "Unknown error",
          });
        }
      }

      runningLog
        .withStatus("success")
        .withItemsCount(processed)
        .withFinishedAt(new Date());
      await this.syncLogRepository.update(runningLog);

      return { processed, conflicts, results };
    } catch (error) {
      runningLog
        .withStatus("failed")
        .withFinishedAt(new Date())
        .withErrorMessage(
          error instanceof Error ? error.message : "Unknown error",
        );
      await this.syncLogRepository.update(runningLog);
      throw error;
    }
  }

  async pull(
    externalUserId: string,
    since?: Date,
  ): Promise<SyncPullResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const startedAt = new Date();

    const transactions = await this.transactionService.findAllForSync(
      localUser.id!,
      since,
    );

    const log = SyncLog.restore({
      userId: localUser.id!,
      direction: "PULL",
      status: "success",
      itemsCount: transactions.length,
      startedAt,
      finishedAt: new Date(),
    })!;
    await this.syncLogRepository.create(log);

    return { transactions, pulledAt: new Date() };
  }

  async status(externalUserId: string): Promise<SyncStatusDto | null> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const log = await this.syncLogRepository.findLatestByUserId(localUser.id!);
    return SyncStatusDto.from(log);
  }
}
