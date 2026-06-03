import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class UpdateCurrencyDto {
  @ApiProperty({ enum: ["BRL", "USD", "EUR"], example: "BRL" })
  @IsString()
  @IsNotEmpty()
  @IsIn(["BRL", "USD", "EUR"])
  currency!: "BRL" | "USD" | "EUR";
}
