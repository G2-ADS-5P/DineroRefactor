import type { ClassOffering } from "@class-offering/domain/models/class-offering.entity";
import { ApiProperty } from "@nestjs/swagger";

export class ClassOfferingDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "uuid-da-disciplina" })
  subjectId: string;

  @ApiProperty({ example: "Algoritmos" })
  subjectName: string;

  @ApiProperty({ example: "uuid-do-professor" })
  teacherId: string;

  @ApiProperty({ example: "Maria Souza" })
  teacherName: string;

  @ApiProperty({ example: "2024-03-01" })
  startDate: Date;

  @ApiProperty({ example: "2024-07-01" })
  endDate: Date;

  @ApiProperty({ example: "active" })
  status: string;

  private constructor(
    id: string | undefined,
    subjectId: string,
    subjectName: string,
    teacherId: string,
    teacherName: string,
    startDate: Date,
    endDate: Date,
    status: string,
  ) {
    this.id = id;
    this.subjectId = subjectId;
    this.subjectName = subjectName;
    this.teacherId = teacherId;
    this.teacherName = teacherName;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
  }

  public static from(
    classOffering: ClassOffering | null,
  ): ClassOfferingDto | null {
    if (!classOffering) return null;
    return new ClassOfferingDto(
      classOffering.id,
      classOffering.subjectId,
      classOffering.subjectName,
      classOffering.teacherId,
      classOffering.teacherName,
      classOffering.startDate,
      classOffering.endDate,
      classOffering.status,
    );
  }
}
