import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateTeacherDto {
  @ApiProperty({ example: "Maria Souza", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "maria@escola.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: "987.654.321-00", required: false })
  @IsString()
  @IsOptional()
  document?: string;

  @ApiProperty({ example: "Doutorado", required: false })
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiProperty({ example: "Matemática", required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ example: "2020-03-01", required: false })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  admissionDate?: Date;
}
