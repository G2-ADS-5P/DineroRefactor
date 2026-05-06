import {
  classOfferingsSchema,
  type EnrollmentClassOfferingStatus,
} from "@enrollment/infra/database/schemas/class-offering.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

export type LocalClassOffering = {
  id: string;
  externalId: string;
  startDate: Date;
  endDate: Date;
  status: EnrollmentClassOfferingStatus;
};

@Injectable()
export class DrizzleClassOfferingRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async upsert(params: {
    externalId: string;
    startDate: Date;
    endDate: Date;
    status: EnrollmentClassOfferingStatus;
  }): Promise<LocalClassOffering> {
    const [row] = await this.drizzleService.db
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
      })
      .returning();

    return row;
  }

  async findByExternalId(
    externalId: string,
  ): Promise<LocalClassOffering | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(classOfferingsSchema)
      .where(eq(classOfferingsSchema.externalId, externalId))
      .limit(1);

    return row ?? null;
  }
}
