import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateTeacherDto {
  @ApiProperty({ example: "Maria Souza" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "maria@escola.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "987.654.321-00" })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({ example: "Doutorado" })
  @IsString()
  @IsNotEmpty()
  degree!: string;

  @ApiProperty({ example: "Matemática" })
  @IsString()
  @IsNotEmpty()
  specialization!: string;

  @ApiProperty({ example: "2020-03-01" })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  admissionDate!: Date;
}
