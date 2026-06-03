import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { SyncLog } from "@sync/domain/models/sync-log.entity";
import type { SyncLogRepository } from "@sync/domain/repositories/sync-log-repository.interface";
import { syncLogsSchema } from "@sync/infra/database/schemas/sync-log.schema";
import { desc, eq } from "drizzle-orm";

@Injectable()
export class DrizzleSyncLogRepository implements SyncLogRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(log: SyncLog): Promise<SyncLog> {
    const [row] = await this.drizzleService.db
      .insert(syncLogsSchema)
      .values({
        userId: log.userId,
        direction: log.direction,
        status: log.status,
        itemsCount: log.itemsCount,
        startedAt: log.startedAt,
        finishedAt: log.finishedAt ?? null,
        errorMessage: log.errorMessage ?? null,
        createdAt: new Date(),
      })
      .returning();

    return this.toEntity(row)!;
  }

  async update(log: SyncLog): Promise<void> {
    await this.drizzleService.db
      .update(syncLogsSchema)
      .set({
        status: log.status,
        itemsCount: log.itemsCount,
        finishedAt: log.finishedAt ?? null,
        errorMessage: log.errorMessage ?? null,
      })
      .where(eq(syncLogsSchema.id, log.id!));
  }

  async findLatestByUserId(userId: string): Promise<SyncLog | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(syncLogsSchema)
      .where(eq(syncLogsSchema.userId, userId))
      .orderBy(desc(syncLogsSchema.createdAt))
      .limit(1);

    return this.toEntity(row);
  }

  private toEntity(row?: typeof syncLogsSchema.$inferSelect): SyncLog | null {
    if (!row) return null;
    return SyncLog.restore({
      id: row.id,
      userId: row.userId,
      direction: row.direction,
      status: row.status,
      itemsCount: row.itemsCount,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
    });
  }
}
