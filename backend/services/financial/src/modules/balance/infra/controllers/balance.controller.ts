import { BalanceService } from "@balance/application/services/balance.service";
import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";

@ApiTags("balance")
@ApiBearerAuth()
@Controller("balance")
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get("summary")
  @ApiOperation({ summary: "Resumo de receitas e despesas por período" })
  @ApiQuery({ name: "startDate", required: true, type: String })
  @ApiQuery({ name: "endDate", required: true, type: String })
  async getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException("startDate and endDate are required");
    }

    return this.balanceService.getSummary(
      user.sub,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
