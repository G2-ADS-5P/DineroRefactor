import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { teachersSchema } from "@users/infra/database/schemas/teacher.schema";
import { eq } from "drizzle-orm";

export type LocalTeacher = {
  id: string;
  externalId: string;
  name: string;
};

@Injectable()
export class DrizzleTeacherRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async upsert(params: {
    externalId: string;
    name: string;
  }): Promise<LocalTeacher> {
    const [row] = await this.drizzleService.db
      .insert(teachersSchema)
      .values({
        externalId: params.externalId,
        name: params.name,
      })
      .onConflictDoUpdate({
        target: teachersSchema.externalId,
        set: {
          name: params.name,
        },
      })
      .returning();

    return row;
  }

  async findByExternalId(externalId: string): Promise<LocalTeacher | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(teachersSchema)
      .where(eq(teachersSchema.externalId, externalId))
      .limit(1);

    return row ?? null;
  }

  async deleteByExternalId(externalId: string): Promise<void> {
    await this.drizzleService.db
      .delete(teachersSchema)
      .where(eq(teachersSchema.externalId, externalId));
  }
}
