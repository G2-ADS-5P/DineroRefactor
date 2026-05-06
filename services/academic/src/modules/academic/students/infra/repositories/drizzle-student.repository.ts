import { Student } from "@academic/students/domain/models/student.entity";
import type { StudentRepository } from "@academic/students/domain/repositories/student-repository.interface";
import { studentsSchema } from "@academic/students/infra/database/schemas/student.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleStudentRepository implements StudentRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(student: Student): Promise<void> {
    await this.drizzleService.db.insert(studentsSchema).values({
      name: student.name,
      email: student.email,
      document: student.document,
      registration: student.registration,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(student: Student): Promise<void> {
    await this.drizzleService.db
      .update(studentsSchema)
      .set({
        name: student.name,
        email: student.email,
        document: student.document,
        registration: student.registration,
        updatedAt: new Date(),
      })
      .where(eq(studentsSchema.id, student.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(studentsSchema)
      .where(eq(studentsSchema.id, id));
  }

  async findById(id: string): Promise<Student | null> {
    const result = await this.drizzleService.db
      .select()
      .from(studentsSchema)
      .where(eq(studentsSchema.id, id))
      .limit(1);

    return Student.restore(result[0]);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const result = await this.drizzleService.db
      .select()
      .from(studentsSchema)
      .where(eq(studentsSchema.email, email.toLowerCase()))
      .limit(1);

    return Student.restore(result[0]);
  }

  async findAll(): Promise<Student[]> {
    const rows = await this.drizzleService.db.select().from(studentsSchema);
    return rows.map((row) => Student.restore(row)!);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Student[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(studentsSchema)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(studentsSchema),
    ]);

    return {
      rows: rows.map((row) => Student.restore(row)!),
      total: countResult.count,
    };
  }
}
