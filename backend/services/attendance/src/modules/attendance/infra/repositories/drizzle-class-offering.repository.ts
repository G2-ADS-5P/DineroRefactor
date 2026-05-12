import {
  type AttendanceClassOfferingStatus,
  classOfferingsSchema,
} from "@attendance/infra/database/schemas/class-offering.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";

@Injectable()
export class DrizzleClassOfferingRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async upsert(params: {
    externalId: string;
    startDate: Date;
    endDate: Date;
    status: AttendanceClassOfferingStatus;
  }): Promise<void> {
    await this.drizzleService.db
      .insert(classOfferingsSchema)
      .values({
        externalId: params.externalId,
        startDate: params.startDate,
        endDate: params.endDate,
        status: params.status,
      })
      .onConflictDoUpdate({
        target: classOfferingsSchema.externalId,
        set: {
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
        },
      });
  }
}
