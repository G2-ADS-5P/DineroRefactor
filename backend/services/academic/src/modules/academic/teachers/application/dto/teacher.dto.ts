import type { Teacher } from "@academic/teachers/domain/models/teacher.entity";
import { ApiProperty } from "@nestjs/swagger";

export class TeacherDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "Maria Souza" })
  name: string;

  @ApiProperty({ example: "maria@escola.com" })
  email: string;

  @ApiProperty({ example: "987.654.321-00" })
  document: string;

  @ApiProperty({ example: "Doutorado" })
  degree: string;

  @ApiProperty({ example: "Matemática" })
  specialization: string;

  @ApiProperty({ example: "2020-03-01" })
  admissionDate: Date;

  private constructor(
    id: string | undefined,
    name: string,
    email: string,
    document: string,
    degree: string,
    specialization: string,
    admissionDate: Date,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.document = document;
    this.degree = degree;
    this.specialization = specialization;
    this.admissionDate = admissionDate;
  }

  public static from(teacher: Teacher | null): TeacherDto | null {
    if (!teacher) return null;
    return new TeacherDto(
      teacher.id,
      teacher.name,
      teacher.email,
      teacher.document,
      teacher.degree,
      teacher.specialization,
      teacher.admissionDate,
    );
  }
}
