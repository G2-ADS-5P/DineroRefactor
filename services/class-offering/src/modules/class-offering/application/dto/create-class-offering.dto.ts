import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateClassOfferingDto {
  @ApiProperty({ example: "uuid-da-disciplina" })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: "Algoritmos" })
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @ApiProperty({ example: "uuid-do-professor" })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ example: "Maria Souza" })
  @IsString()
  @IsNotEmpty()
  teacherName: string;

  @ApiProperty({ example: "2024-03-01" })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ example: "2024-07-01" })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
