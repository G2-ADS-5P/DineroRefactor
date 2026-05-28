import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class CreateCardDto {
  @ApiProperty({ example: "Nubank Roxinho" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "Mastercard" })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({ example: "1234" })
  @IsString()
  @Length(4, 4)
  lastDigits!: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @IsPositive()
  creditLimit!: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 31 })
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay!: number;
}
