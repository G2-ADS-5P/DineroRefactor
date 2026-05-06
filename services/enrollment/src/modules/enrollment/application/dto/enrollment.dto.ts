import type { Enrollment } from "@enrollment/domain/models/enrollment.entity";
import { ApiProperty } from "@nestjs/swagger";

export class EnrollmentDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid-do-aluno" })
  studentId: string;

  @ApiProperty({ example: "uuid-da-turma" })
  classOfferingId: string;

  @ApiProperty({ example: "active" })
  status: string;

  @ApiProperty()
  enrolledAt: Date;

  @ApiProperty({ nullable: true })
  canceledAt: Date | null | undefined;

  private constructor(
    id: string | undefined,
    studentId: string,
    classOfferingId: string,
    status: string,
    enrolledAt: Date,
    canceledAt: Date | null | undefined,
  ) {
    this.id = id;
    this.studentId = studentId;
    this.classOfferingId = classOfferingId;
    this.status = status;
    this.enrolledAt = enrolledAt;
    this.canceledAt = canceledAt;
  }

  public static from(enrollment: Enrollment | null): EnrollmentDto | null {
    if (!enrollment) return null;
    return new EnrollmentDto(
      enrollment.id,
      enrollment.studentId,
      enrollment.classOfferingId,
      enrollment.status,
      enrollment.enrolledAt,
      enrollment.canceledAt,
    );
  }
}
