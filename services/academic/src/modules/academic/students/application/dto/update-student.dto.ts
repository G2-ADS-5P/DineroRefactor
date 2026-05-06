import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateStudentDto {
  @ApiProperty({ example: "João Silva", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "joao@escola.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: "123.456.789-00", required: false })
  @IsString()
  @IsOptional()
  document?: string;

  @ApiProperty({ example: "2024001", required: false })
  @IsString()
  @IsOptional()
  registration?: string;
}
