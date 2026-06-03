import { BankStatementTransactionDto } from "@openfinance/application/dto/bank-statement-transaction.dto";
import { OpenfinanceService } from "@openfinance/application/services/openfinance.service";
import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { HateoasList } from "@shared/infra/hateoas";

@ApiTags("accounts")
@ApiBearerAuth()
@Controller("accounts")
export class AccountsController {
  constructor(private readonly openfinanceService: OpenfinanceService) {}

  @Get(":id/transactions")
  @ApiOperation({
    summary: "Extrato da conta",
    description:
      "Retorna o histórico de transações (extrato) de uma conta bancária conectada via Open Finance sandbox.",
  })
  @ApiNotFoundResponse({ description: "Conta não encontrada" })
  @HateoasList<BankStatementTransactionDto>({
    basePath: "/v1/accounts",
    itemLinks: (item) => ({
      account: { href: `/v1/accounts/${item.accountId}`, method: "GET" },
    }),
  })
  async getTransactions(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.openfinanceService.getTransactionsByAccount(id, user.sub);
  }
}
