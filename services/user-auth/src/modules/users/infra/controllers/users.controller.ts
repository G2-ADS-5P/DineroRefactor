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
  Post,
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
// import { Permission } from "@shared/domain/enums/permission.enum";
// import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { Public } from "@shared/infra/decorators/public.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";
import { CreateUserDto } from "@users/application/dto/create-user.dto";
import { UpdateUserDto } from "@users/application/dto/update-user.dto";
import { UserResponseDto } from "@users/application/dto/user-response.dto";
import { UserService } from "@users/application/services/user.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Public() // @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: "Listar usuários" })
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

  @Get(":id")
  @Public() // @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @HateoasItem<UserResponseDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      update: { href: `/v1/users/${item.id}`, method: "PUT" },
      delete: { href: `/v1/users/${item.id}`, method: "DELETE" },
      list: { href: "/v1/users", method: "GET" },
      create: { href: "/v1/users", method: "POST" },
    }),
  })
  async findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @Public() // @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: "Criar usuário" })
  async create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public() // @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiNoContentResponse({ description: "Usuário atualizado" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async update(@Param("id") id: string, @Body() body: UpdateUserDto) {
    return this.userService.edit(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public() // @RequirePermissions(Permission.USERS_DELETE)
  @ApiOperation({ summary: "Remover usuário" })
  @ApiNoContentResponse({ description: "Usuário removido" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
