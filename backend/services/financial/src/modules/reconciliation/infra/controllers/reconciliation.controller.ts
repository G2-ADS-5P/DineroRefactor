import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResolveDuplicatesDto } from "@reconciliation/application/dto/resolve-duplicates.dto";
import { ReconciliationService } from "@reconciliation/application/services/reconciliation.service";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";

@ApiTags("reconciliation")
@ApiBearerAuth()
@Controller("reconciliation")
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get("duplicates")
  @ApiOperation({ summary: "Listar grupos de transacoes duplicadas" })
  async findDuplicates(@CurrentUser() user: AuthenticatedUser) {
    return this.reconciliationService.findDuplicates(user.sub);
  }

  @Post("duplicates/resolve")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Resolver duplicatas via soft delete nos IDs indicados",
  })
  async resolve(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ResolveDuplicatesDto,
  ) {
    await this.reconciliationService.resolve(user.sub, body);
  }
}
