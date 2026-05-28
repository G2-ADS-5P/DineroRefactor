import { ApiProperty } from "@nestjs/swagger";
import type { SyncLog } from "@sync/domain/models/sync-log.entity";

export class SyncStatusDto {
  @ApiProperty({ nullable: true }) id: string | undefined;
  @ApiProperty() userId: string;
  @ApiProperty() direction: string;
  @ApiProperty() status: string;
  @ApiProperty() itemsCount: number;
  @ApiProperty() startedAt: Date;
  @ApiProperty({ nullable: true }) finishedAt: Date | undefined;
  @ApiProperty({ nullable: true }) errorMessage: string | undefined;
  @ApiProperty() createdAt: Date | undefined;

  private constructor(props: {
    id: string | undefined;
    userId: string;
    direction: string;
    status: string;
    itemsCount: number;
    startedAt: Date;
    finishedAt: Date | undefined;
    errorMessage: string | undefined;
    createdAt: Date | undefined;
  }) {
    Object.assign(this, props);
  }

  static from(log: SyncLog | null): SyncStatusDto | null {
    if (!log) return null;
    return new SyncStatusDto({
      id: log.id,
      userId: log.userId,
      direction: log.direction,
      status: log.status,
      itemsCount: log.itemsCount,
      startedAt: log.startedAt,
      finishedAt: log.finishedAt,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
    });
  }
}
