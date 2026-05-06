import { AttendanceDto } from "@attendance/application/dto/attendance.dto";
import { RegisterAttendanceDto } from "@attendance/application/dto/register-attendance.dto";
import { AttendanceService } from "@attendance/application/services/attendance.service";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasList } from "@shared/infra/hateoas";

@ApiTags("attendances")
@ApiBearerAuth()
@Controller("attendances")
export class AttendancesController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @RequirePermissions(Permission.ATTENDANCES_READ)
  @ApiOperation({ summary: "Listar presenças por turma ou por aluno e turma" })
  @ApiQuery({ name: "class_offering_id", required: true, type: String })
  @ApiQuery({ name: "student_id", required: false, type: String })
  @HateoasList<AttendanceDto>({
    basePath: "/v1/attendances",
    itemLinks: (item) => ({
      self: { href: `/v1/attendances/${item.id}`, method: "GET" },
    }),
  })
  async findAll(
    @Query("class_offering_id") classOfferingId: string,
    @Query("student_id") studentId?: string,
  ) {
    if (studentId) {
      return this.attendanceService.findByStudentAndClassOffering(
        studentId,
        classOfferingId,
      );
    }
    return this.attendanceService.findByClassOffering(classOfferingId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.ATTENDANCES_WRITE)
  @ApiOperation({ summary: "Registrar presença" })
  async register(@Body() body: RegisterAttendanceDto) {
    return this.attendanceService.register(body);
  }
}
