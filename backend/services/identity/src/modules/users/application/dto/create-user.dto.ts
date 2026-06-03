import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "Joao da Silva" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "user@dinero.app" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "senha123" })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: "+5511999999999", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "1995-05-20", required: false, type: String })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({ example: "Sao Paulo, BR", required: false })
  @IsString()
  @IsOptional()
  location?: string;
}
