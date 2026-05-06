import { ClassOfferingDto } from "@class-offering/application/dto/class-offering.dto";
import { CreateClassOfferingDto } from "@class-offering/application/dto/create-class-offering.dto";
import { ClassOfferingService } from "@class-offering/application/services/class-offering.service";
import { ClassOfferingStatus } from "@class-offering/domain/models/class-offering.entity";
import {
  Body,
  Controller,
  DefaultValuePipe,
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
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("classOfferings")
@ApiBearerAuth()
@Controller("classOfferings")
export class ClassOfferingsController {
  constructor(private readonly classOfferingService: ClassOfferingService) {}

  @Get()
  @RequirePermissions(Permission.CLASS_OFFERINGS_READ)
  @ApiOperation({ summary: "Listar turmas" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<ClassOfferingDto>({
    basePath: "/v1/classOfferings",
    itemLinks: (item) => ({
      self: { href: `/v1/classOfferings/${item.id}`, method: "GET" },
      activate:
        item.status === "inactive"
          ? { href: `/v1/classOfferings/${item.id}/activate`, method: "PATCH" }
          : null,
      deactivate:
        item.status === "active"
          ? {
              href: `/v1/classOfferings/${item.id}/deactivate`,
              method: "PATCH",
            }
          : null,
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.classOfferingService.listPaginated({ page, limit });
  }

  @Get(":id")
  @RequirePermissions(Permission.CLASS_OFFERINGS_READ)
  @ApiOperation({ summary: "Buscar turma por ID" })
  @ApiNotFoundResponse({ description: "Turma não encontrada" })
  @HateoasItem<ClassOfferingDto>({
    basePath: "/v1/classOfferings",
    itemLinks: (item) => ({
      self: { href: `/v1/classOfferings/${item.id}`, method: "GET" },
      list: { href: "/v1/classOfferings", method: "GET" },
      create: { href: "/v1/classOfferings", method: "POST" },
      activate:
        item.status === "inactive"
          ? { href: `/v1/classOfferings/${item.id}/activate`, method: "PATCH" }
          : null,
      deactivate:
        item.status === "active"
          ? {
              href: `/v1/classOfferings/${item.id}/deactivate`,
              method: "PATCH",
            }
          : null,
    }),
  })
  async findById(@Param("id") id: string) {
    return this.classOfferingService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.CLASS_OFFERINGS_WRITE)
  @ApiOperation({ summary: "Criar turma" })
  async create(@Body() body: CreateClassOfferingDto) {
    return this.classOfferingService.create(body);
  }

  @Patch(":id/activate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.CLASS_OFFERINGS_WRITE)
  @ApiOperation({ summary: "Ativar turma" })
  @ApiNoContentResponse({ description: "Turma ativada" })
  @ApiNotFoundResponse({ description: "Turma não encontrada" })
  async activate(@Param("id") id: string) {
    return this.classOfferingService.changeStatus(
      id,
      ClassOfferingStatus.ACTIVE,
    );
  }

  @Patch(":id/deactivate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.CLASS_OFFERINGS_WRITE)
  @ApiOperation({ summary: "Desativar turma" })
  @ApiNoContentResponse({ description: "Turma desativada" })
  @ApiNotFoundResponse({ description: "Turma não encontrada" })
  async deactivate(@Param("id") id: string) {
    return this.classOfferingService.changeStatus(
      id,
      ClassOfferingStatus.INACTIVE,
    );
  }
}
