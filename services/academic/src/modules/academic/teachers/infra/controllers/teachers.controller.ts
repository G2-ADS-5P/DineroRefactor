import { CreateTeacherDto } from "@academic/teachers/application/dto/create-teacher.dto";
import { TeacherDto } from "@academic/teachers/application/dto/teacher.dto";
import { UpdateTeacherDto } from "@academic/teachers/application/dto/update-teacher.dto";
import { TeacherService } from "@academic/teachers/application/services/teacher.service";
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
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("teachers")
@ApiBearerAuth()
@Controller("teachers")
export class TeachersController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  @RequirePermissions(Permission.TEACHERS_READ)
  @ApiOperation({ summary: "Listar professores" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<TeacherDto>({
    basePath: "/v1/teachers",
    itemLinks: (item) => ({
      self: { href: `/v1/teachers/${item.id}`, method: "GET" },
      update: { href: `/v1/teachers/${item.id}`, method: "PUT" },
      delete: { href: `/v1/teachers/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.teacherService.listPaginated({ page, limit });
  }

  @Get(":id")
  @RequirePermissions(Permission.TEACHERS_READ)
  @ApiOperation({ summary: "Buscar professor por ID" })
  @ApiNotFoundResponse({ description: "Professor não encontrado" })
  @HateoasItem<TeacherDto>({
    basePath: "/v1/teachers",
    itemLinks: (item) => ({
      self: { href: `/v1/teachers/${item.id}`, method: "GET" },
      update: { href: `/v1/teachers/${item.id}`, method: "PUT" },
      delete: { href: `/v1/teachers/${item.id}`, method: "DELETE" },
      list: { href: "/v1/teachers", method: "GET" },
      create: { href: "/v1/teachers", method: "POST" },
    }),
  })
  async findById(@Param("id") id: string) {
    return this.teacherService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.TEACHERS_WRITE)
  @ApiOperation({ summary: "Criar professor" })
  async create(@Body() body: CreateTeacherDto) {
    return this.teacherService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.TEACHERS_WRITE)
  @ApiOperation({ summary: "Atualizar professor" })
  @ApiNoContentResponse({ description: "Professor atualizado" })
  @ApiNotFoundResponse({ description: "Professor não encontrado" })
  async update(@Param("id") id: string, @Body() body: UpdateTeacherDto) {
    return this.teacherService.edit(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.TEACHERS_DELETE)
  @ApiOperation({ summary: "Remover professor" })
  @ApiNoContentResponse({ description: "Professor removido" })
  @ApiNotFoundResponse({ description: "Professor não encontrado" })
  async remove(@Param("id") id: string) {
    return this.teacherService.remove(id);
  }
}
