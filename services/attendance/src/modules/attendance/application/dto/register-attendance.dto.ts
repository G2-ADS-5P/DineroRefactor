import { AttendanceStatus } from "@attendance/domain/models/attendance.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";

export class RegisterAttendanceDto {
  @ApiProperty({ example: "uuid-do-aluno" })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: "uuid-da-aula" })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: "uuid-da-turma" })
  @IsUUID()
  @IsNotEmpty()
  classOfferingId: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;
}
