import type { EnrollmentClassOfferingStatus } from "@enrollment/infra/database/schemas/class-offering.schema";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsIn, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class EnrollStudentDto {
  @ApiProperty({ example: "uuid-do-aluno" })
  @IsUUID()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: "Joao Silva" })
  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @ApiProperty({ example: "uuid-da-turma" })
  @IsUUID()
  @IsNotEmpty()
  classOfferingId!: string;

  @ApiProperty({ example: "2024-03-01" })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  classOfferingStartDate!: Date;

  @ApiProperty({ example: "2024-07-01" })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  classOfferingEndDate!: Date;

  @ApiProperty({ example: "active", enum: ["active", "inactive"] })
  @IsIn(["active", "inactive"])
  @IsNotEmpty()
  classOfferingStatus!: EnrollmentClassOfferingStatus;
}
