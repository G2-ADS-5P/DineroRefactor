import { SubjectService } from "@academic/subjects/application/services/subject.service";
import { SubjectMessagingService } from "@academic/subjects/application/services/subject-messaging.service";
import { SUBJECT_REPOSITORY } from "@academic/subjects/domain/repositories/subject-repository.interface";
import { SubjectsController } from "@academic/subjects/infra/controllers/subjects.controller";
import { DrizzleSubjectRepository } from "@academic/subjects/infra/repositories/drizzle-subject.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [SubjectsController],
  providers: [
    SubjectService,
    SubjectMessagingService,
    DrizzleSubjectRepository,
    {
      provide: SUBJECT_REPOSITORY,
      useExisting: DrizzleSubjectRepository,
    },
  ],
})
export class SubjectsModule {}
