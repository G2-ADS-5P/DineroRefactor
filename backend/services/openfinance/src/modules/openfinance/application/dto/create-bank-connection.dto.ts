import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreateBankConnectionDto {
  @ApiProperty({ example: "Banco do Brasil", description: "Nome do banco" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;
}
