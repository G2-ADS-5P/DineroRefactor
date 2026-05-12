import { AttendanceService } from "@attendance/application/services/attendance.service";
import { AttendanceMessageConsumerService } from "@attendance/application/services/attendance-message-consumer.service";
import { AttendanceMessagingService } from "@attendance/application/services/attendance-messaging.service";
import { ATTENDANCE_REPOSITORY } from "@attendance/domain/repositories/attendance-repository.interface";
import { AttendancesController } from "@attendance/infra/controllers/attendances.controller";
import { DrizzleAttendanceRepository } from "@attendance/infra/repositories/drizzle-attendance.repository";
import { DrizzleClassOfferingRepository } from "@attendance/infra/repositories/drizzle-class-offering.repository";
import { DrizzleEnrollmentRepository } from "@attendance/infra/repositories/drizzle-enrollment.repository";
import { DrizzleStudentRepository } from "@attendance/infra/repositories/drizzle-student.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [AttendancesController],
  providers: [
    AttendanceMessageConsumerService,
    AttendanceMessagingService,
    AttendanceService,
    DrizzleStudentRepository,
    DrizzleClassOfferingRepository,
    DrizzleEnrollmentRepository,
    DrizzleAttendanceRepository,
    {
      provide: ATTENDANCE_REPOSITORY,
      useExisting: DrizzleAttendanceRepository,
    },
  ],
})
export class AttendanceModule {}
