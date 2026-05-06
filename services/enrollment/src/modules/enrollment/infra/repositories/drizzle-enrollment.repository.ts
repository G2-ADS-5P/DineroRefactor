import {
  Enrollment,
  EnrollmentStatus,
} from "@enrollment/domain/models/enrollment.entity";
import type { EnrollmentRepository } from "@enrollment/domain/repositories/enrollment-repository.interface";
import { classOfferingsSchema } from "@enrollment/infra/database/schemas/class-offering.schema";
import { enrollmentsSchema } from "@enrollment/infra/database/schemas/enrollment.schema";
import { studentsSchema } from "@enrollment/infra/database/schemas/student.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { and, eq } from "drizzle-orm";

@Injectable()
export class DrizzleEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(enrollment: Enrollment): Promise<Enrollment> {
    const [row] = await this.drizzleService.db
      .insert(enrollmentsSchema)
      .values({
        studentId: enrollment.studentRefId,
        classOfferingId: enrollment.classOfferingRefId,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        canceledAt: enrollment.canceledAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const created = await this.findById(row.id);

    if (!created) {
      throw new Error("Created enrollment not found");
    }

    return created;
  }

  async cancel(id: string): Promise<void> {
    await this.drizzleService.db
      .update(enrollmentsSchema)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(enrollmentsSchema.id, id));
  }

  async findById(id: string): Promise<Enrollment | null> {
    const result = await this.drizzleService.db
      .select({
        enrollment: enrollmentsSchema,
        student: studentsSchema,
        classOffering: classOfferingsSchema,
      })
      .from(enrollmentsSchema)
      .innerJoin(
        studentsSchema,
        eq(enrollmentsSchema.studentId, studentsSchema.id),
      )
      .innerJoin(
        classOfferingsSchema,
        eq(enrollmentsSchema.classOfferingId, classOfferingsSchema.id),
      )
      .where(eq(enrollmentsSchema.id, id))
      .limit(1);

    if (!result[0]) return null;

    return this.toEntity(result[0]);
  }

  async findByClassOfferingId(classOfferingId: string): Promise<Enrollment[]> {
    const rows = await this.drizzleService.db
      .select({
        enrollment: enrollmentsSchema,
        student: studentsSchema,
        classOffering: classOfferingsSchema,
      })
      .from(enrollmentsSchema)
      .innerJoin(
        studentsSchema,
        eq(enrollmentsSchema.studentId, studentsSchema.id),
      )
      .innerJoin(
        classOfferingsSchema,
        eq(enrollmentsSchema.classOfferingId, classOfferingsSchema.id),
      )
      .where(eq(enrollmentsSchema.classOfferingId, classOfferingId));

    return rows.map((row) => this.toEntity(row));
  }

  async findByStudentAndClassOffering(
    studentId: string,
    classOfferingId: string,
  ): Promise<Enrollment | null> {
    const result = await this.drizzleService.db
      .select({
        enrollment: enrollmentsSchema,
        student: studentsSchema,
        classOffering: classOfferingsSchema,
      })
      .from(enrollmentsSchema)
      .innerJoin(
        studentsSchema,
        eq(enrollmentsSchema.studentId, studentsSchema.id),
      )
      .innerJoin(
        classOfferingsSchema,
        eq(enrollmentsSchema.classOfferingId, classOfferingsSchema.id),
      )
      .where(
        and(
          eq(enrollmentsSchema.studentId, studentId),
          eq(enrollmentsSchema.classOfferingId, classOfferingId),
          eq(enrollmentsSchema.status, "active"),
        ),
      )
      .limit(1);

    if (!result[0]) return null;

    return this.toEntity(result[0]);
  }

  private toEntity(row: {
    enrollment: typeof enrollmentsSchema.$inferSelect;
    student: typeof studentsSchema.$inferSelect;
    classOffering: typeof classOfferingsSchema.$inferSelect;
  }): Enrollment {
    return Enrollment.restore({
      id: row.enrollment.id,
      studentRefId: row.student.id,
      studentId: row.student.externalId,
      classOfferingRefId: row.classOffering.id,
      classOfferingId: row.classOffering.externalId,
      status: row.enrollment.status as EnrollmentStatus,
      enrolledAt: row.enrollment.enrolledAt,
      canceledAt: row.enrollment.canceledAt,
      createdAt: row.enrollment.createdAt,
      updatedAt: row.enrollment.updatedAt,
    })!;
  }
}
