import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { AddPortfolioAssetDto } from "@portfolio/application/dto/add-portfolio-asset.dto";
import { CreatePortfolioTransactionDto } from "@portfolio/application/dto/create-portfolio-transaction.dto";
import {
  PortfolioDto,
  PortfolioItemDto,
} from "@portfolio/application/dto/portfolio.dto";
import { PortfolioAccessResponseDto } from "@portfolio/application/dto/portfolio-access-response.dto";
import { PortfolioTransactionDto } from "@portfolio/application/dto/portfolio-transaction.dto";
import { PortfolioTransactionResultDto } from "@portfolio/application/dto/portfolio-transaction-result.dto";
import { PortfolioService } from "@portfolio/application/services/portfolio.service";
import { PortfolioAccessService } from "@portfolio/application/services/portfolio-access.service";
import { PortfolioWriteAccessGuard } from "@portfolio/infra/guards/portfolio-write-access.guard";
import { Permission } from "@shared/domain/enums/permission.enum";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem } from "@shared/infra/hateoas";

@ApiTags("portfolio")
@ApiBearerAuth()
@Controller("portfolio")
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly portfolioAccessService: PortfolioAccessService,
  ) {}

  @Get()
  @RequirePermissions(Permission.PORTFOLIO_READ)
  @ApiOperation({ summary: "Consultar portfolio do usuario autenticado" })
  @ApiQuery({ name: "range", required: false, type: String })
  @HateoasItem<PortfolioDto>({
    basePath: "/v1/portfolio",
    itemLinks: () => ({
      self: { href: "/v1/portfolio", method: "GET" },
      addAsset: { href: "/v1/portfolio/assets", method: "POST" },
      addTransaction: { href: "/v1/portfolio/transactions", method: "POST" },
      transactions: { href: "/v1/portfolio/transactions", method: "GET" },
      assets: { href: "/v1/assets", method: "GET" },
    }),
  })
  async getPortfolio(
    @CurrentUser() user: AuthenticatedUser,
    @Query("range") range?: string,
  ) {
    return this.portfolioService.getPortfolio(
      user.sub,
      this.portfolioService.normalizeRange(range),
    );
  }

  @Get("access/me")
  @RequirePermissions(Permission.PORTFOLIO_READ)
  @ApiOperation({ summary: "Consultar acesso de escrita no portfolio" })
  async getAccessStatus(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PortfolioAccessResponseDto> {
    return this.portfolioAccessService.getAccessStatus(user.sub);
  }

  @Get("transactions")
  @RequirePermissions(Permission.PORTFOLIO_READ)
  @ApiOperation({ summary: "Listar lancamentos do portfolio" })
  async listTransactions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PortfolioTransactionDto[]> {
    return this.portfolioService.listTransactions(user.sub);
  }

  @Get("assets/:id")
  @RequirePermissions(Permission.PORTFOLIO_READ)
  @ApiOperation({ summary: "Buscar ativo do portfolio por ID" })
  @HateoasItem<PortfolioItemDto>({
    basePath: "/v1/portfolio/assets",
    itemLinks: (item) => ({
      self: { href: `/v1/portfolio/assets/${item.id}`, method: "GET" },
      portfolio: { href: "/v1/portfolio", method: "GET" },
      assets: { href: "/v1/assets", method: "GET" },
    }),
  })
  async getPortfolioAsset(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.portfolioService.getPortfolioAsset(user.sub, id);
  }

  @Post("assets")
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.PORTFOLIO_WRITE)
  @UseGuards(PortfolioWriteAccessGuard)
  @ApiOperation({ summary: "Adicionar ativo ao portfolio" })
  @HateoasItem<PortfolioItemDto>({
    basePath: "/v1/portfolio/assets",
    itemLinks: (item) => ({
      self: { href: `/v1/portfolio/assets/${item.id}`, method: "GET" },
      portfolio: { href: "/v1/portfolio", method: "GET" },
      assets: { href: "/v1/assets", method: "GET" },
    }),
  })
  async addAsset(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AddPortfolioAssetDto,
  ) {
    return this.portfolioService.addAsset(user.sub, body);
  }

  @Post("transactions")
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.PORTFOLIO_WRITE)
  @UseGuards(PortfolioWriteAccessGuard)
  @ApiOperation({ summary: "Adicionar lancamento de compra ou venda" })
  @HateoasItem<PortfolioTransactionResultDto>({
    basePath: "/v1/portfolio/transactions",
    itemLinks: () => ({
      portfolio: { href: "/v1/portfolio", method: "GET" },
      transactions: { href: "/v1/portfolio/transactions", method: "GET" },
      assets: { href: "/v1/assets", method: "GET" },
    }),
  })
  async addTransaction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePortfolioTransactionDto,
  ) {
    return this.portfolioService.addTransaction(user.sub, body);
  }
}
