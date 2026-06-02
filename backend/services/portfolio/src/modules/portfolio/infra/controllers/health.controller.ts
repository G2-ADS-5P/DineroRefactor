import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@shared/infra/decorators/public.decorator";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: "Verificar saude do servico de portfolio" })
  check(): Record<string, string> {
    return {
      status: "ok",
      service: "portfolio",
      timestamp: new Date().toISOString(),
    };
  }
}
