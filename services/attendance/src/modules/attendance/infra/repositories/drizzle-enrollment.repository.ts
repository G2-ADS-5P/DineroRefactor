import {
  type AttendanceEnrollmentStatus,
  enrollmentsSchema,
} from "@attendance/infra/database/schemas/enrollment.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";

@Injectable()
export class DrizzleEnrollmentRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async upsert(params: {
    externalId: string;
    studentId: string;
    classOfferingId: string;
    status: AttendanceEnrollmentStatus;
  }): Promise<void> {
    await this.drizzleService.db
      .insert(enrollmentsSchema)
      .values({
        externalId: params.externalId,
        studentId: params.studentId,
        classOfferingId: params.classOfferingId,
        status: params.status,
      })
      .onConflictDoUpdate({
        target: enrollmentsSchema.externalId,
        set: {
          studentId: params.studentId,
          classOfferingId: params.classOfferingId,
          status: params.status,
        },
      });
  }
}
