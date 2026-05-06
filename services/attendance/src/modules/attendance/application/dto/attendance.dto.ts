import type { Attendance } from "@attendance/domain/models/attendance.entity";
import { ApiProperty } from "@nestjs/swagger";

export class AttendanceDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid-do-aluno" })
  studentId: string;

  @ApiProperty({ example: "uuid-da-aula" })
  lessonId: string;

  @ApiProperty({ example: "uuid-da-turma" })
  classOfferingId: string;

  @ApiProperty({ example: "present" })
  status: string;

  private constructor(
    id: string | undefined,
    studentId: string,
    lessonId: string,
    classOfferingId: string,
    status: string,
  ) {
    this.id = id;
    this.studentId = studentId;
    this.lessonId = lessonId;
    this.classOfferingId = classOfferingId;
    this.status = status;
  }

  public static from(attendance: Attendance | null): AttendanceDto | null {
    if (!attendance) return null;
    return new AttendanceDto(
      attendance.id,
      attendance.studentId,
      attendance.lessonId,
      attendance.classOfferingId,
      attendance.status,
    );
  }
}
