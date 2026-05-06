import { AcademicMessageConsumerService } from "@class-offering/application/services/academic-message-consumer.service";
import { ClassOfferingService } from "@class-offering/application/services/class-offering.service";
import { ClassOfferingMessagingService } from "@class-offering/application/services/class-offering-messaging.service";
import { CLASS_OFFERING_REPOSITORY } from "@class-offering/domain/repositories/class-offering-repository.interface";
import { ClassOfferingsController } from "@class-offering/infra/controllers/class-offerings.controller";
import { DrizzleClassOfferingRepository } from "@class-offering/infra/repositories/drizzle-class-offering.repository";
import { DrizzleSubjectRepository } from "@class-offering/infra/repositories/drizzle-subject.repository";
import { DrizzleTeacherRepository } from "@class-offering/infra/repositories/drizzle-teacher.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [ClassOfferingsController],
  providers: [
    AcademicMessageConsumerService,
    ClassOfferingMessagingService,
    ClassOfferingService,
    DrizzleClassOfferingRepository,
    DrizzleSubjectRepository,
    DrizzleTeacherRepository,
    {
      provide: CLASS_OFFERING_REPOSITORY,
      useExisting: DrizzleClassOfferingRepository,
    },
  ],
})
export class ClassOfferingModule {}
