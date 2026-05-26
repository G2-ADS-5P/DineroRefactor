import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ example: "Joao da Silva", required: false })
  @IsString()
  @IsOptional()
  name?: string;

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
