import { AccountDto } from "@openfinance/application/dto/account.dto";
import { AuthorizeBankConnectionDto } from "@openfinance/application/dto/authorize-bank-connection.dto";
import { BankConnectionDto } from "@openfinance/application/dto/bank-connection.dto";
import { CardDto } from "@openfinance/application/dto/card.dto";
import { CreateBankConnectionDto } from "@openfinance/application/dto/create-bank-connection.dto";
import { CreateBankConnectionResponseDto } from "@openfinance/application/dto/create-bank-connection-response.dto";
import { OpenfinanceService } from "@openfinance/application/services/openfinance.service";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { HateoasList } from "@shared/infra/hateoas";

@ApiTags("bank-connections")
@ApiBearerAuth()
@Controller("bank-connections")
export class BankConnectionsController {
  constructor(private readonly openfinanceService: OpenfinanceService) {}

  @Post()
  @ApiOperation({
    summary: "Iniciar conexão bancária [SANDBOX]",
    description:
      "Inicia o fluxo de consentimento simulado. Retorna uma consentUrl de sandbox — em produção, " +
      "o usuário seria redirecionado ao banco para autorizar o acesso. " +
      "Após criação, chame POST /bank-connections/:id/authorize para simular a aprovação.",
  })
  async initiate(
    @Body() body: CreateBankConnectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CreateBankConnectionResponseDto> {
    return this.openfinanceService.initiateBankConnection({
      userId: user.sub,
      bankName: body.bankName,
    });
  }

  @Post(":id/authorize")
  @ApiOperation({
    summary: "Autorizar consentimento",
    description:
      "**Modo Pluggy:** passe o `itemId` retornado pelo widget Pluggy Connect no body. " +
      "O backend busca contas, extrato e cartões reais do Pluggy.\n\n" +
      "**Modo Sandbox:** omita o body. O sistema gera automaticamente dados mock realistas.",
  })
  @ApiOkResponse({ type: BankConnectionDto })
  @ApiNotFoundResponse({ description: "Conexão bancária não encontrada" })
  async authorize(
    @Param("id") id: string,
    @Body() body: AuthorizeBankConnectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BankConnectionDto> {
    return this.openfinanceService.authorizeConnection(id, user.sub, body.itemId);
  }

  @Get()
  @ApiOperation({ summary: "Listar conexões bancárias do usuário" })
  @HateoasList<BankConnectionDto>({
    basePath: "/v1/bank-connections",
    itemLinks: (item) => ({
      self: { href: `/v1/bank-connections/${item.id}`, method: "GET" },
      accounts: { href: `/v1/bank-connections/${item.id}/accounts`, method: "GET" },
      cards: { href: `/v1/bank-connections/${item.id}/cards`, method: "GET" },
      authorize: { href: `/v1/bank-connections/${item.id}/authorize`, method: "POST" },
      revoke: { href: `/v1/bank-connections/${item.id}/revoke`, method: "POST" },
    }),
  })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.openfinanceService.listBankConnections(user.sub);
  }

  @Get(":id/accounts")
  @ApiOperation({ summary: "Contas bancárias da conexão" })
  @ApiNotFoundResponse({ description: "Conexão bancária não encontrada" })
  @HateoasList<AccountDto>({
    basePath: "/v1/bank-connections",
    itemLinks: (item) => ({
      self: { href: `/v1/accounts/${item.id}`, method: "GET" },
      transactions: { href: `/v1/accounts/${item.id}/transactions`, method: "GET" },
    }),
  })
  async getAccounts(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.openfinanceService.getAccountsByConnection(id, user.sub);
  }

  @Get(":id/cards")
  @ApiOperation({ summary: "Cartões de crédito da conexão" })
  @ApiNotFoundResponse({ description: "Conexão bancária não encontrada" })
  @HateoasList<CardDto>({
    basePath: "/v1/bank-connections",
    itemLinks: (item) => ({
      self: { href: `/v1/cards/${item.id}`, method: "GET" },
    }),
  })
  async getCards(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.openfinanceService.getCardsByConnection(id, user.sub);
  }

  @Post(":id/revoke")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Revogar conexão bancária" })
  @ApiNoContentResponse({ description: "Conexão bancária revogada" })
  @ApiNotFoundResponse({ description: "Conexão bancária não encontrada" })
  async revoke(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.openfinanceService.revokeBankConnection(id, user.sub);
  }
}
