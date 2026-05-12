import type { Subject } from "@academic/subjects/domain/models/subject.entity";
import { ApiProperty } from "@nestjs/swagger";

export class SubjectDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "Álgebra Linear" })
  name: string;

  @ApiProperty({ example: "MAT101" })
  code: string;

  @ApiProperty({ example: 60 })
  workload: number;

  @ApiProperty({ example: "Fundamentos de álgebra e matrizes." })
  description: string;

  private constructor(
    id: string | undefined,
    name: string,
    code: string,
    workload: number,
    description: string,
  ) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.workload = workload;
    this.description = description;
  }

  public static from(subject: Subject | null): SubjectDto | null {
    if (!subject) return null;
    return new SubjectDto(
      subject.id,
      subject.name,
      subject.code,
      subject.workload,
      subject.description,
    );
  }
}
