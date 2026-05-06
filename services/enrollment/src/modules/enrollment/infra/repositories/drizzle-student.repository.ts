import { studentsSchema } from "@enrollment/infra/database/schemas/student.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

export type LocalStudent = {
  id: string;
  externalId: string;
  name: string;
};

@Injectable()
export class DrizzleStudentRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async upsert(params: {
    externalId: string;
    name: string;
  }): Promise<LocalStudent> {
    const [row] = await this.drizzleService.db
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
      })
      .returning();

    return row;
  }

  async findByExternalId(externalId: string): Promise<LocalStudent | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(studentsSchema)
      .where(eq(studentsSchema.externalId, externalId))
      .limit(1);

    return row ?? null;
  }

  async deleteByExternalId(externalId: string): Promise<void> {
    await this.drizzleService.db
      .delete(studentsSchema)
      .where(eq(studentsSchema.externalId, externalId));
  }
}
