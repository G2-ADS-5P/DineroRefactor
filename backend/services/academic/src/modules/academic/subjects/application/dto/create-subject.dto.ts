import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateSubjectDto {
  @ApiProperty({ example: "Álgebra Linear" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "MAT101" })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 60 })
  @IsInt()
  @IsPositive()
  workload!: number;

  @ApiProperty({ example: "Fundamentos de álgebra e matrizes." })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
