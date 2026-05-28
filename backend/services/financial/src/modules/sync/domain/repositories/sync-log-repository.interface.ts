import type { SyncLog } from "@sync/domain/models/sync-log.entity";

export const SYNC_LOG_REPOSITORY = Symbol("SYNC_LOG_REPOSITORY");

export interface SyncLogRepository {
  create(log: SyncLog): Promise<SyncLog>;
  update(log: SyncLog): Promise<void>;
  findLatestByUserId(userId: string): Promise<SyncLog | null>;
}
