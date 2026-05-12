import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateSubjectDto {
  @ApiProperty({ example: "Álgebra Linear", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "MAT101", required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 60, required: false })
  @IsInt()
  @IsPositive()
  @IsOptional()
  workload?: number;

  @ApiProperty({
    example: "Fundamentos de álgebra e matrizes.",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
