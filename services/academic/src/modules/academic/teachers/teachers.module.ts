import { TeacherService } from "@academic/teachers/application/services/teacher.service";
import { TeacherMessagingService } from "@academic/teachers/application/services/teacher-messaging.service";
import { TEACHER_REPOSITORY } from "@academic/teachers/domain/repositories/teacher-repository.interface";
import { TeachersController } from "@academic/teachers/infra/controllers/teachers.controller";
import { DrizzleTeacherRepository } from "@academic/teachers/infra/repositories/drizzle-teacher.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [TeachersController],
  providers: [
    TeacherService,
    TeacherMessagingService,
    DrizzleTeacherRepository,
    {
      provide: TEACHER_REPOSITORY,
      useExisting: DrizzleTeacherRepository,
    },
  ],
})
export class TeachersModule {}
