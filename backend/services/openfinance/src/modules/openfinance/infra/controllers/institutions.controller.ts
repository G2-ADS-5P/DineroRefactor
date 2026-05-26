import { InstitutionDto } from "@openfinance/application/dto/institution.dto";
import { SANDBOX_INSTITUTIONS } from "@openfinance/application/data/sandbox-institutions";
import { PluggyApiService } from "@openfinance/infra/external/pluggy-api.service";
import { Controller, Get, Logger, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "@shared/infra/decorators/public.decorator";

@ApiTags("institutions")
@ApiBearerAuth()
@Controller("institutions")
export class InstitutionsController {
  private readonly logger = new Logger(InstitutionsController.name);

  constructor(private readonly pluggyApiService: PluggyApiService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: "Listar instituições financeiras disponíveis",
    description:
      "Retorna as instituições bancárias que o usuário pode conectar. " +
      "**Modo Pluggy:** retorna os conectores reais do Pluggy (sandbox + live). " +
      "**Modo Sandbox:** retorna a lista estática de bancos simulados.",
  })
  @ApiQuery({
    name: "sandbox",
    required: false,
    type: Boolean,
    description: "Filtrar apenas instituições sandbox (Pluggy mode only)",
  })
  async findAll(
    @Query("sandbox") sandboxOnly?: string,
  ): Promise<InstitutionDto[]> {
    if (this.pluggyApiService.isConfigured()) {
      try {
        const onlySandbox = sandboxOnly === "true";
        const connectors = await this.pluggyApiService.getConnectors(onlySandbox);
        return connectors.map((c) => InstitutionDto.fromPluggyConnector(c));
      } catch (error) {
        this.logger.warn(
          "Failed to fetch Pluggy connectors, falling back to sandbox list",
          error,
        );
      }
    }

    return SANDBOX_INSTITUTIONS.map((i) => InstitutionDto.fromSandbox(i));
  }
}
