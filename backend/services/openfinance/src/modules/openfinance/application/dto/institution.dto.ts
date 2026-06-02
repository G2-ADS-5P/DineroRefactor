import type { SandboxInstitution } from "@openfinance/application/data/sandbox-institutions";
import type { PluggyConnector } from "@openfinance/infra/external/pluggy-api.service";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class InstitutionDto {
  @ApiProperty({ example: "nubank" })
  id: string;

  @ApiProperty({ example: "Nubank" })
  name: string;

  @ApiProperty({ example: "digital", enum: ["digital", "traditional", "investment"] })
  type: string;

  @ApiProperty({ example: "#8A05BE" })
  primaryColor: string;

  @ApiPropertyOptional({ example: "https://logo.pluggy.ai/nubank.png", nullable: true })
  logoUrl: string | null;

  @ApiProperty({ example: "sandbox", enum: ["sandbox", "live"] })
  mode: "sandbox" | "live";

  private constructor(
    id: string,
    name: string,
    type: string,
    primaryColor: string,
    logoUrl: string | null,
    mode: "sandbox" | "live",
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.primaryColor = primaryColor;
    this.logoUrl = logoUrl;
    this.mode = mode;
  }

  static fromSandbox(institution: SandboxInstitution): InstitutionDto {
    return new InstitutionDto(
      institution.id,
      institution.name,
      institution.type,
      institution.primaryColor,
      null,
      "sandbox",
    );
  }

  static fromPluggyConnector(connector: PluggyConnector): InstitutionDto {
    const type = connector.type.includes("BANK") ? "traditional" : "investment";
    return new InstitutionDto(
      String(connector.id),
      connector.name,
      type,
      connector.primaryColor ?? "#000000",
      connector.imageUrl,
      connector.isSandbox ? "sandbox" : "live",
    );
  }
}
