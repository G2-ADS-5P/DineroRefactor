import { Teacher } from "@academic/teachers/domain/models/teacher.entity";
import type { TeacherRepository } from "@academic/teachers/domain/repositories/teacher-repository.interface";
import { teachersSchema } from "@academic/teachers/infra/database/schemas/teacher.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleTeacherRepository implements TeacherRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(teacher: Teacher): Promise<void> {
    await this.drizzleService.db.insert(teachersSchema).values({
      name: teacher.name,
      email: teacher.email,
      document: teacher.document,
      degree: teacher.degree,
      specialization: teacher.specialization,
      admissionDate: teacher.admissionDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(teacher: Teacher): Promise<void> {
    await this.drizzleService.db
      .update(teachersSchema)
      .set({
        name: teacher.name,
        email: teacher.email,
        document: teacher.document,
        degree: teacher.degree,
        specialization: teacher.specialization,
        admissionDate: teacher.admissionDate,
        updatedAt: new Date(),
      })
      .where(eq(teachersSchema.id, teacher.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(teachersSchema)
      .where(eq(teachersSchema.id, id));
  }

  async findById(id: string): Promise<Teacher | null> {
    const result = await this.drizzleService.db
      .select()
      .from(teachersSchema)
      .where(eq(teachersSchema.id, id))
      .limit(1);

    return Teacher.restore(result[0]);
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    const result = await this.drizzleService.db
      .select()
      .from(teachersSchema)
      .where(eq(teachersSchema.email, email.toLowerCase()))
      .limit(1);

    return Teacher.restore(result[0]);
  }

  async findAll(): Promise<Teacher[]> {
    const rows = await this.drizzleService.db.select().from(teachersSchema);
    return rows.map((row) => Teacher.restore(row)!);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Teacher[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(teachersSchema)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(teachersSchema),
    ]);

    return {
      rows: rows.map((row) => Teacher.restore(row)!),
      total: countResult.count,
    };
  }
}
