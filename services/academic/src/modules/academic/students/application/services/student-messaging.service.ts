import { StudentDto } from "@academic/students/application/dto/student.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  AcademicExchangeName,
  AcademicRoutingKey,
} from "@shared/contracts/events/academic-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class StudentMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StudentMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.STUDENT_CREATED,
        ),
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.STUDENT_UPDATED,
        ),
        this.sharedMessagingService.assertExchange(
          AcademicExchangeName.STUDENT_DELETED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert student exchanges", error);
      throw error;
    }
  }

  async publishStudentCreated(student: StudentDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.STUDENT_CREATED,
      AcademicRoutingKey.STUDENT_CREATED,
      student,
    );
  }

  async publishStudentUpdated(student: StudentDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.STUDENT_UPDATED,
      AcademicRoutingKey.STUDENT_UPDATED,
      student,
    );
  }

  async publishStudentDeleted(student: StudentDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AcademicExchangeName.STUDENT_DELETED,
      AcademicRoutingKey.STUDENT_DELETED,
      student,
    );
  }
}
