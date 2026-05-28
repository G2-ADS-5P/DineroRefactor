import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { SyncPushDto } from "@sync/application/dto/sync-push.dto";
import { SyncService } from "@sync/application/services/sync.service";

@ApiTags("sync")
@ApiBearerAuth()
@Controller("sync")
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post("push")
  @ApiOperation({
    summary: "Enviar batch de transacoes do mobile para o servidor",
  })
  async push(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SyncPushDto,
  ) {
    return this.syncService.push(user.sub, body);
  }

  @Get("pull")
  @ApiOperation({
    summary: "Buscar transacoes atualizadas desde uma data (ou todas)",
  })
  @ApiQuery({
    name: "since",
    required: false,
    type: String,
    description:
      "ISO timestamp — retorna transacoes com updated_at ou deleted_at > since",
  })
  async pull(
    @CurrentUser() user: AuthenticatedUser,
    @Query("since") since?: string,
  ) {
    return this.syncService.pull(user.sub, since ? new Date(since) : undefined);
  }

  @Get("status")
  @ApiOperation({ summary: "Ultimo registro de sync do usuario" })
  async status(@CurrentUser() user: AuthenticatedUser) {
    return this.syncService.status(user.sub);
  }
}
