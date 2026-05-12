import { EnrollStudentDto } from "@enrollment/application/dto/enroll-student.dto";
import { EnrollmentDto } from "@enrollment/application/dto/enrollment.dto";
import { EnrollmentService } from "@enrollment/application/services/enrollment.service";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { HateoasList } from "@shared/infra/hateoas";

@ApiTags("enrollments")
@ApiBearerAuth()
@Controller("enrollments")
export class EnrollmentsController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @RequirePermissions(Permission.ENROLLMENTS_READ)
  @ApiOperation({ summary: "Listar matrículas por turma" })
  @ApiQuery({ name: "class_offering_id", required: true, type: String })
  @HateoasList<EnrollmentDto>({
    basePath: "/v1/enrollments",
    itemLinks: (item) => ({
      self: { href: `/v1/enrollments/${item.id}`, method: "GET" },
      cancel: { href: `/v1/enrollments/${item.id}/cancel`, method: "PATCH" },
    }),
  })
  async findByClassOffering(
    @Query("class_offering_id") classOfferingId: string,
  ) {
    return this.enrollmentService.listByClassOffering(classOfferingId);
  }

  @Post()
  @RequirePermissions(Permission.ENROLLMENTS_WRITE)
  @ApiOperation({ summary: "Matricular estudante em turma" })
  async enroll(@Body() body: EnrollStudentDto) {
    return this.enrollmentService.enroll(body);
  }

  @Patch(":id/cancel")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.ENROLLMENTS_DELETE)
  @ApiOperation({ summary: "Cancelar matrícula" })
  @ApiNoContentResponse({ description: "Matrícula cancelada" })
  @ApiNotFoundResponse({ description: "Matrícula não encontrada" })
  async cancel(@Param("id") id: string) {
    return this.enrollmentService.cancel(id);
  }
}
