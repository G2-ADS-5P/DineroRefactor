import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { AssetDetailDto } from "@portfolio/application/dto/asset-detail.dto";
import { AssetHistoryPointDto } from "@portfolio/application/dto/asset-history.dto";
import { AssetMarketDto } from "@portfolio/application/dto/asset-market.dto";
import { CreateAssetDto } from "@portfolio/application/dto/create-asset.dto";
import { AssetService } from "@portfolio/application/services/asset.service";
import { PortfolioWriteAccessGuard } from "@portfolio/infra/guards/portfolio-write-access.guard";
import { Permission } from "@shared/domain/enums/permission.enum";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("assets")
@ApiBearerAuth()
@Controller("assets")
export class AssetsController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @RequirePermissions(Permission.PORTFOLIO_READ)
  @ApiOperation({ summary: "Listar ativos disponiveis para portfolio" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @ApiQuery({ name: "q", required: false, type: String })
  @ApiQuery({ name: "type", required: false, type: String })
  @ApiQuery({ name: "category", required: false, type: String })
  @ApiQuery({ name: "range", required: false, type: String })
  @HateoasList<AssetMarketDto>({
    basePath: "/v1/assets",
    itemLinks: (item) => ({
      self: { href: `/v1/assets/${item.id}`, method: "GET" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("q") search?: string,
    @Query("type") type?: string,
    @Query("category") category?: string,
    @Query("range") range?: string,
  ) {
    return this.assetService.listPaginated({
      page,
      limit,
      search,
      type: this.assetService.normalizeType(type ?? category),
      range: this.assetService.normalizeRange(range),
    });
  }

  @Get(":id/history")
  @RequirePermissions(Permission.PORTFOLIO_READ)
  @ApiOperation({ summary: "Consultar historico temporal do ativo" })
  @ApiQuery({ name: "range", required: false, type: String })
  async history(
    @Param("id") id: string,
    @Query("range") range?: string,
  ): Promise<AssetHistoryPointDto[]> {
    return this.assetService.getHistory(
      id,
      this.assetService.normalizeRange(range),
    );
  }

  @Get(":id")
  @RequirePermissions(Permission.PORTFOLIO_READ)
  @ApiOperation({ summary: "Buscar ativo por ID" })
  @ApiNotFoundResponse({ description: "Ativo nao encontrado" })
  @ApiQuery({ name: "range", required: false, type: String })
  @HateoasItem<AssetDetailDto>({
    basePath: "/v1/assets",
    itemLinks: (item) => ({
      self: { href: `/v1/assets/${item.id}`, method: "GET" },
      list: { href: "/v1/assets", method: "GET" },
      history: { href: `/v1/assets/${item.id}/history`, method: "GET" },
    }),
  })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Query("range") range?: string,
  ) {
    return this.assetService.getDetail(
      user.sub,
      id,
      this.assetService.normalizeRange(range),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.PORTFOLIO_WRITE)
  @UseGuards(PortfolioWriteAccessGuard)
  @ApiOperation({ summary: "Cadastrar ativo para uso no portfolio" })
  @ApiConflictResponse({ description: "Ticker ja cadastrado" })
  @HateoasItem<AssetMarketDto>({
    basePath: "/v1/assets",
    itemLinks: (item) => ({
      self: { href: `/v1/assets/${item.id}`, method: "GET" },
      list: { href: "/v1/assets", method: "GET" },
    }),
  })
  async create(@Body() body: CreateAssetDto) {
    return this.assetService.create(body);
  }
}
