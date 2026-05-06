import { studentsSchema } from "@attendance/infra/database/schemas/student.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleStudentRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async upsert(params: { externalId: string; name: string }): Promise<void> {
    await this.drizzleService.db
      .insert(studentsSchema)
      .values({
        externalId: params.externalId,
        name: params.name,
      })
      .onConflictDoUpdate({
        target: studentsSchema.externalId,
        set: {
          name: params.name,
        },
      });
  }

  async deleteByExternalId(externalId: string): Promise<void> {
    await this.drizzleService.db
      .delete(studentsSchema)
      .where(eq(studentsSchema.externalId, externalId));
  }
}
