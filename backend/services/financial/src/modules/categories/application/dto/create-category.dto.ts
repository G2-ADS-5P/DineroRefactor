import { ApiProperty } from "@nestjs/swagger";
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ example: "Salário" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "income", enum: ["income", "expense"] })
  @IsIn(["income", "expense"])
  type!: string;

  @ApiProperty({ example: "#00FF00" })
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiProperty({ example: "money" })
  @IsString()
  @IsNotEmpty()
  icon!: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
