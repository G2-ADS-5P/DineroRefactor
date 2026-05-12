import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateStudentDto {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "joao@escola.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "123.456.789-00" })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({ example: "2024001" })
  @IsString()
  @IsNotEmpty()
  registration!: string;
}
