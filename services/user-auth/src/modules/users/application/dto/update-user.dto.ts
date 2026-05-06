import { ApiProperty } from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ example: "user@school.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: "novaSenha123", required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: "uuid-do-professor", required: false })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiProperty({ example: "Maria Souza", required: false })
  @IsString()
  @IsOptional()
  teacherName?: string;

  @ApiProperty({
    enum: Permission,
    isArray: true,
    required: false,
    example: [Permission.STUDENTS_READ],
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}
