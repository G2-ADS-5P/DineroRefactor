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
  Put,
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
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { UpdateUserDto } from "@users/application/dto/update-user.dto";
import { UserResponseDto } from "@users/application/dto/user-response.dto";
import { UserService } from "@users/application/services/user.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: "Listar usuarios" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<UserResponseDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      update: { href: `/v1/users/${item.id}`, method: "PUT" },
      delete: { href: `/v1/users/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.listPaginated({ page, limit });
  }

  @Get("me")
  @ApiOperation({ summary: "Perfil do usuario autenticado" })
  @HateoasItem<UserResponseDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      update: { href: `/v1/users/${item.id}`, method: "PUT" },
      delete: { href: `/v1/users/${item.id}`, method: "DELETE" },
      preferences: { href: "/v1/preferences/me", method: "GET" },
    }),
  })
  async findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.findById(user.sub);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar usuario por ID" })
  @ApiNotFoundResponse({ description: "Usuario nao encontrado" })
  @HateoasItem<UserResponseDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      update: { href: `/v1/users/${item.id}`, method: "PUT" },
      delete: { href: `/v1/users/${item.id}`, method: "DELETE" },
      list: { href: "/v1/users", method: "GET" },
    }),
  })
  async findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Atualizar usuario" })
  @ApiNoContentResponse({ description: "Usuario atualizado" })
  @ApiNotFoundResponse({ description: "Usuario nao encontrado" })
  async update(@Param("id") id: string, @Body() body: UpdateUserDto) {
    await this.userService.edit(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover usuario" })
  @ApiNoContentResponse({ description: "Usuario removido" })
  @ApiNotFoundResponse({ description: "Usuario nao encontrado" })
  async remove(@Param("id") id: string) {
    await this.userService.remove(id);
  }
}
