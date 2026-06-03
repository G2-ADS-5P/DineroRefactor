import { CardResponseDto } from "@cards/application/dto/card-response.dto";
import { CreateCardDto } from "@cards/application/dto/create-card.dto";
import { UpdateCardDto } from "@cards/application/dto/update-card.dto";
import { CardService } from "@cards/application/services/card.service";
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("cards")
@ApiBearerAuth()
@Controller("cards")
export class CardsController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({ summary: "Listar cartões" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<CardResponseDto>({
    basePath: "/v1/cards",
    itemLinks: (item) => ({
      self: { href: `/v1/cards/${item.id}`, method: "GET" },
      update: { href: `/v1/cards/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/cards/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.cardService.listPaginated(user.sub, { page, limit });
  }

  @Post()
  @ApiOperation({ summary: "Criar cartão" })
  @HateoasItem<CardResponseDto>({
    basePath: "/v1/cards",
    itemLinks: (item) => ({
      self: { href: `/v1/cards/${item.id}`, method: "GET" },
      update: { href: `/v1/cards/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/cards/${item.id}`, method: "DELETE" },
      list: { href: "/v1/cards", method: "GET" },
    }),
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCardDto,
  ) {
    return this.cardService.create(user.sub, body);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalhar cartão" })
  @ApiNotFoundResponse({ description: "Cartão não encontrado" })
  @HateoasItem<CardResponseDto>({
    basePath: "/v1/cards",
    itemLinks: (item) => ({
      self: { href: `/v1/cards/${item.id}`, method: "GET" },
      update: { href: `/v1/cards/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/cards/${item.id}`, method: "DELETE" },
      list: { href: "/v1/cards", method: "GET" },
    }),
  })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.cardService.findById(user.sub, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar cartão" })
  @ApiNotFoundResponse({ description: "Cartão não encontrado" })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateCardDto,
  ) {
    return this.cardService.update(user.sub, id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover cartão" })
  @ApiNoContentResponse({ description: "Cartão removido" })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.cardService.remove(user.sub, id);
  }
}
