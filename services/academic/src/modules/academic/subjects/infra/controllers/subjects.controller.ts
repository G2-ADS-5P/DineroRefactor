import { CreateSubjectDto } from "@academic/subjects/application/dto/create-subject.dto";
import { SubjectDto } from "@academic/subjects/application/dto/subject.dto";
import { UpdateSubjectDto } from "@academic/subjects/application/dto/update-subject.dto";
import { SubjectService } from "@academic/subjects/application/services/subject.service";
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

@ApiTags("subjects")
@ApiBearerAuth()
@Controller("subjects")
export class SubjectsController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  @RequirePermissions(Permission.SUBJECTS_READ)
  @ApiOperation({ summary: "Listar disciplinas" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<SubjectDto>({
    basePath: "/v1/subjects",
    itemLinks: (item) => ({
      self: { href: `/v1/subjects/${item.id}`, method: "GET" },
      update: { href: `/v1/subjects/${item.id}`, method: "PUT" },
      delete: { href: `/v1/subjects/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.subjectService.listPaginated({ page, limit });
  }

  @Get(":id")
  @RequirePermissions(Permission.SUBJECTS_READ)
  @ApiOperation({ summary: "Buscar disciplina por ID" })
  @ApiNotFoundResponse({ description: "Disciplina não encontrada" })
  @HateoasItem<SubjectDto>({
    basePath: "/v1/subjects",
    itemLinks: (item) => ({
      self: { href: `/v1/subjects/${item.id}`, method: "GET" },
      update: { href: `/v1/subjects/${item.id}`, method: "PUT" },
      delete: { href: `/v1/subjects/${item.id}`, method: "DELETE" },
      list: { href: "/v1/subjects", method: "GET" },
      create: { href: "/v1/subjects", method: "POST" },
    }),
  })
  async findById(@Param("id") id: string) {
    return this.subjectService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.SUBJECTS_WRITE)
  @ApiOperation({ summary: "Criar disciplina" })
  async create(@Body() body: CreateSubjectDto) {
    return this.subjectService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SUBJECTS_WRITE)
  @ApiOperation({ summary: "Atualizar disciplina" })
  @ApiNoContentResponse({ description: "Disciplina atualizada" })
  @ApiNotFoundResponse({ description: "Disciplina não encontrada" })
  async update(@Param("id") id: string, @Body() body: UpdateSubjectDto) {
    return this.subjectService.edit(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SUBJECTS_DELETE)
  @ApiOperation({ summary: "Remover disciplina" })
  @ApiNoContentResponse({ description: "Disciplina removida" })
  @ApiNotFoundResponse({ description: "Disciplina não encontrada" })
  async remove(@Param("id") id: string) {
    return this.subjectService.remove(id);
  }
}
