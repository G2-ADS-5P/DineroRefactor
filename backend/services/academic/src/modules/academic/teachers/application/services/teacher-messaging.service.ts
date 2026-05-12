import { TeacherDto } from "@academic/teachers/application/dto/teacher.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  AcademicExchangeName,
  AcademicRoutingKey,
} from "@shared/contracts/events/academic-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class TeacherMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TeacherMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.TEACHER_CREATED,
        ),
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.TEACHER_UPDATED,
        ),
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.TEACHER_DELETED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert teacher exchanges", error);
      throw error;
    }
  }

  async publishTeacherCreated(teacher: TeacherDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.TEACHER_CREATED,
      AcademicRoutingKey.TEACHER_CREATED,
      teacher,
    );
  }

  async publishTeacherUpdated(teacher: TeacherDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.TEACHER_UPDATED,
      AcademicRoutingKey.TEACHER_UPDATED,
      teacher,
    );
  }

  async publishTeacherDeleted(teacher: TeacherDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.TEACHER_DELETED,
      AcademicRoutingKey.TEACHER_DELETED,
      teacher,
    );
  }
}
