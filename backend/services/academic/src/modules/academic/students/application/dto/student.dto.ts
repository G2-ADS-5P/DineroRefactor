import type { Student } from "@academic/students/domain/models/student.entity";
import { ApiProperty } from "@nestjs/swagger";

export class StudentDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "João Silva" })
  name: string;

  @ApiProperty({ example: "joao@escola.com" })
  email: string;

  @ApiProperty({ example: "123.456.789-00" })
  document: string;

  @ApiProperty({ example: "2024001" })
  registration: string;

  private constructor(
    id: string | undefined,
    name: string,
    email: string,
    document: string,
    registration: string,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.document = document;
    this.registration = registration;
  }

  public static fromStudent(student: Student | null): StudentDto | null {
    if (!student) return null;
    return new StudentDto(
      student.id,
      student.name,
      student.email,
      student.document,
      student.registration,
    );
  }
}
