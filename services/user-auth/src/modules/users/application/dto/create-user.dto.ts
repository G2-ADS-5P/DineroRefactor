import { ApiProperty } from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "user@school.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "senha123" })
  @IsString()
  @IsNotEmpty()
  password!: string;

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
    example: [Permission.STUDENTS_READ],
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions!: Permission[];
}
