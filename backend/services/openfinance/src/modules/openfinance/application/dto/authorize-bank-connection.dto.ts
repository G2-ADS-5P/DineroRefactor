import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class AuthorizeBankConnectionDto {
  @ApiPropertyOptional({
    example: "pluggy-item-uuid",
    description:
      "[Pluggy] ID do item retornado pelo widget Pluggy após o usuário conectar o banco. " +
      "Obrigatório quando PLUGGY_CLIENT_ID está configurado. " +
      "Omitir em modo sandbox para usar dados gerados automaticamente.",
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({
    example: "nubank",
    description:
      "[Sandbox] ID da instituição (retornado por GET /institutions). " +
      "Quando informado, os dados mock gerados refletem o perfil real do banco (descrições, bandeiras de cartão, faixas de saldo).",
  })
  @IsOptional()
  @IsString()
  institutionId?: string;
}
