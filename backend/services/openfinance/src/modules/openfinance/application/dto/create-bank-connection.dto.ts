import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateBankConnectionDto {
  @ApiProperty({ example: "Banco do Brasil", description: "Nome do banco" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bankName: string;

  @ApiPropertyOptional({
    example: "nubank",
    description: "ID da instituição financeira (retornado por GET /institutions). Usado para personalizar dados sandbox.",
  })
  @IsString()
  @IsOptional()
  institutionId?: string;
}
