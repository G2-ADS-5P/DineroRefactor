import { EnrollmentService } from "@enrollment/application/services/enrollment.service";
import { EnrollmentMessageConsumerService } from "@enrollment/application/services/enrollment-message-consumer.service";
import { EnrollmentMessagingService } from "@enrollment/application/services/enrollment-messaging.service";
import { ENROLLMENT_REPOSITORY } from "@enrollment/domain/repositories/enrollment-repository.interface";
import { EnrollmentsController } from "@enrollment/infra/controllers/enrollments.controller";
import { DrizzleClassOfferingRepository } from "@enrollment/infra/repositories/drizzle-class-offering.repository";
import { DrizzleEnrollmentRepository } from "@enrollment/infra/repositories/drizzle-enrollment.repository";
import { DrizzleStudentRepository } from "@enrollment/infra/repositories/drizzle-student.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentMessageConsumerService,
    EnrollmentMessagingService,
    EnrollmentService,
    DrizzleStudentRepository,
    DrizzleClassOfferingRepository,
    DrizzleEnrollmentRepository,
    {
      provide: ENROLLMENT_REPOSITORY,
      useExisting: DrizzleEnrollmentRepository,
    },
  ],
})
export class EnrollmentModule {}
