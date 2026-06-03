import { ApiProperty } from "@nestjs/swagger";
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class UpdateCategoryDto {
  @ApiProperty({ example: "Salário", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    example: "income",
    enum: ["income", "expense"],
    required: false,
  })
  @IsOptional()
  @IsIn(["income", "expense"])
  type?: string;

  @ApiProperty({ example: "#00FF00", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color?: string;

  @ApiProperty({ example: "money", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  icon?: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
