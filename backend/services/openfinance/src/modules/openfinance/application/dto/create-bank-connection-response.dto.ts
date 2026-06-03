import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBankConnectionResponseDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "Nubank" })
  bankName: string;

  @ApiProperty({ example: "pending_consent" })
  status: string;

  @ApiPropertyOptional({
    example: "eyJhbGciOiJSUzI1NiJ9...",
    description:
      "[Modo Pluggy] Token de acesso para inicializar o widget Pluggy Connect no frontend. " +
      "Use: new PluggyConnect({ connectToken, onSuccess: (itemId) => authorize(itemId) })",
  })
  connectToken?: string;

  @ApiPropertyOptional({
    example: "https://sandbox.openfinance.example.com/consent/uuid?redirect_uri=...",
    description:
      "[Modo Sandbox] URL simulada de consentimento. " +
      "Chame POST /bank-connections/:id/authorize para simular a aprovação.",
  })
  consentUrl?: string;

  constructor(props: {
    id: string | undefined;
    bankName: string;
    status: string;
    connectToken?: string;
    consentUrl?: string;
  }) {
    this.id = props.id;
    this.bankName = props.bankName;
    this.status = props.status;
    this.connectToken = props.connectToken;
    this.consentUrl = props.consentUrl;
  }
}
