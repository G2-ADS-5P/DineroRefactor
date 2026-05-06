import {
  ClassOffering,
  ClassOfferingStatus,
} from "@class-offering/domain/models/class-offering.entity";
import type { ClassOfferingRepository } from "@class-offering/domain/repositories/class-offering-repository.interface";
import { classOfferingsSchema } from "@class-offering/infra/database/schemas/class-offering.schema";
import { subjectsSchema } from "@class-offering/infra/database/schemas/subject.schema";
import { teachersSchema } from "@class-offering/infra/database/schemas/teacher.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleClassOfferingRepository implements ClassOfferingRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(classOffering: ClassOffering): Promise<ClassOffering> {
    const [row] = await this.drizzleService.db
      .insert(classOfferingsSchema)
      .values({
        subjectId: classOffering.subjectRefId,
        teacherId: classOffering.teacherRefId,
        startDate: classOffering.startDate,
        endDate: classOffering.endDate,
        status: classOffering.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const created = await this.findById(row.id);

    if (!created) {
      throw new Error("Created class offering not found");
    }

    return created;
  }

  async findAll(): Promise<ClassOffering[]> {
    const rows = await this.drizzleService.db
      .select({
        classOffering: classOfferingsSchema,
        subject: subjectsSchema,
        teacher: teachersSchema,
      })
      .from(classOfferingsSchema)
      .innerJoin(
        subjectsSchema,
        eq(classOfferingsSchema.subjectId, subjectsSchema.id),
      )
      .innerJoin(
        teachersSchema,
        eq(classOfferingsSchema.teacherId, teachersSchema.id),
      );

    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<ClassOffering | null> {
    const result = await this.drizzleService.db
      .select({
        classOffering: classOfferingsSchema,
        subject: subjectsSchema,
        teacher: teachersSchema,
      })
      .from(classOfferingsSchema)
      .innerJoin(
        subjectsSchema,
        eq(classOfferingsSchema.subjectId, subjectsSchema.id),
      )
      .innerJoin(
        teachersSchema,
        eq(classOfferingsSchema.teacherId, teachersSchema.id),
      )
      .where(eq(classOfferingsSchema.id, id))
      .limit(1);

    if (!result[0]) return null;

    return this.toEntity(result[0]);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: ClassOffering[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select({
          classOffering: classOfferingsSchema,
          subject: subjectsSchema,
          teacher: teachersSchema,
        })
        .from(classOfferingsSchema)
        .innerJoin(
          subjectsSchema,
          eq(classOfferingsSchema.subjectId, subjectsSchema.id),
        )
        .innerJoin(
          teachersSchema,
          eq(classOfferingsSchema.teacherId, teachersSchema.id),
        )
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(classOfferingsSchema),
    ]);

    return {
      rows: rows.map((row) => this.toEntity(row)),
      total: countResult.count,
    };
  }

  async updateStatus(id: string, status: ClassOfferingStatus): Promise<void> {
    await this.drizzleService.db
      .update(classOfferingsSchema)
      .set({ status, updatedAt: new Date() })
      .where(eq(classOfferingsSchema.id, id));
  }

  private toEntity(row: {
    classOffering: typeof classOfferingsSchema.$inferSelect;
    subject: typeof subjectsSchema.$inferSelect;
    teacher: typeof teachersSchema.$inferSelect;
  }): ClassOffering {
    return ClassOffering.restore({
      id: row.classOffering.id,
      subjectRefId: row.subject.id,
      subjectId: row.subject.externalId,
      subjectName: row.subject.name,
      teacherRefId: row.teacher.id,
      teacherId: row.teacher.externalId,
      teacherName: row.teacher.name,
      startDate: row.classOffering.startDate,
      endDate: row.classOffering.endDate,
      status: row.classOffering.status as ClassOfferingStatus,
      createdAt: row.classOffering.createdAt,
      updatedAt: row.classOffering.updatedAt,
    })!;
  }
}
