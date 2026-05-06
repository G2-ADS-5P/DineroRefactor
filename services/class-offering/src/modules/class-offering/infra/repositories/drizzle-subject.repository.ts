import { subjectsSchema } from "@class-offering/infra/database/schemas/subject.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

export type LocalSubject = {
  id: string;
  externalId: string;
  name: string;
};

@Injectable()
export class DrizzleSubjectRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async upsert(params: {
    externalId: string;
    name: string;
  }): Promise<LocalSubject> {
    const [row] = await this.drizzleService.db
      .insert(subjectsSchema)
      .values({
        externalId: params.externalId,
        name: params.name,
      })
      .onConflictDoUpdate({
        target: subjectsSchema.externalId,
        set: {
          name: params.name,
        },
      })
      .returning();

    return row;
  }

  async findByExternalId(externalId: string): Promise<LocalSubject | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(subjectsSchema)
      .where(eq(subjectsSchema.externalId, externalId))
      .limit(1);

    return row ?? null;
  }

  async deleteByExternalId(externalId: string): Promise<void> {
    await this.drizzleService.db
      .delete(subjectsSchema)
      .where(eq(subjectsSchema.externalId, externalId));
  }
}
