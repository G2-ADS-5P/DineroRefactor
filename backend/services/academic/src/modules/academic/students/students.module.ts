import { StudentService } from "@academic/students/application/services/student.service";
import { StudentMessagingService } from "@academic/students/application/services/student-messaging.service";
import { STUDENT_REPOSITORY } from "@academic/students/domain/repositories/student-repository.interface";
import { StudentsController } from "@academic/students/infra/controllers/students.controller";
import { DrizzleStudentRepository } from "@academic/students/infra/repositories/drizzle-student.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [StudentsController],
  providers: [
    StudentService,
    StudentMessagingService,
    DrizzleStudentRepository,
    {
      provide: STUDENT_REPOSITORY,
      useExisting: DrizzleStudentRepository,
    },
  ],
})
export class StudentsModule {}
