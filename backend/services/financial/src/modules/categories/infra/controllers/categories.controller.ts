import { CategoryResponseDto } from "@categories/application/dto/category-response.dto";
import { CreateCategoryDto } from "@categories/application/dto/create-category.dto";
import { UpdateCategoryDto } from "@categories/application/dto/update-category.dto";
import { CategoryService } from "@categories/application/services/category.service";
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

@ApiTags("categories")
@ApiBearerAuth()
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: "Listar categorias" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<CategoryResponseDto>({
    basePath: "/v1/categories",
    itemLinks: (item) => ({
      self: { href: `/v1/categories/${item.id}`, method: "GET" },
      update: { href: `/v1/categories/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/categories/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.categoryService.listPaginated(user.sub, { page, limit });
  }

  @Post()
  @ApiOperation({ summary: "Criar categoria" })
  @HateoasItem<CategoryResponseDto>({
    basePath: "/v1/categories",
    itemLinks: (item) => ({
      self: { href: `/v1/categories/${item.id}`, method: "GET" },
      update: { href: `/v1/categories/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/categories/${item.id}`, method: "DELETE" },
      list: { href: "/v1/categories", method: "GET" },
    }),
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoryService.create(user.sub, body);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalhar categoria" })
  @ApiNotFoundResponse({ description: "Categoria não encontrada" })
  @HateoasItem<CategoryResponseDto>({
    basePath: "/v1/categories",
    itemLinks: (item) => ({
      self: { href: `/v1/categories/${item.id}`, method: "GET" },
      update: { href: `/v1/categories/${item.id}`, method: "PATCH" },
      delete: { href: `/v1/categories/${item.id}`, method: "DELETE" },
      list: { href: "/v1/categories", method: "GET" },
    }),
  })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.categoryService.findById(user.sub, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar categoria" })
  @ApiNotFoundResponse({ description: "Categoria não encontrada" })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoryService.update(user.sub, id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover categoria" })
  @ApiNoContentResponse({ description: "Categoria removida" })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    await this.categoryService.remove(user.sub, id);
  }
}
