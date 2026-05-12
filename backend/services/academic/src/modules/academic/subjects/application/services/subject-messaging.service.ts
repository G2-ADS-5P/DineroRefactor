import { SubjectDto } from "@academic/subjects/application/dto/subject.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  AcademicExchangeName,
  AcademicRoutingKey,
} from "@shared/contracts/events/academic-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class SubjectMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SubjectMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.SUBJECT_CREATED,
        ),
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.SUBJECT_UPDATED,
        ),
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.SUBJECT_DELETED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert subject exchanges", error);
      throw error;
    }
  }

  async publishSubjectCreated(subject: SubjectDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.SUBJECT_CREATED,
      AcademicRoutingKey.SUBJECT_CREATED,
      subject,
    );
  }

  async publishSubjectUpdated(subject: SubjectDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.SUBJECT_UPDATED,
      AcademicRoutingKey.SUBJECT_UPDATED,
      subject,
    );
  }

  async publishSubjectDeleted(subject: SubjectDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.SUBJECT_DELETED,
      AcademicRoutingKey.SUBJECT_DELETED,
      subject,
    );
  }
}
