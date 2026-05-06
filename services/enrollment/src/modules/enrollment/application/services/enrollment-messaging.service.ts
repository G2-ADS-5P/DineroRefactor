import { EnrollmentDto } from "@enrollment/application/dto/enrollment.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  EnrollmentExchangeName,
  EnrollmentRoutingKey,
} from "@shared/contracts/events/enrollment-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class EnrollmentMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EnrollmentMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          EnrollmentExchangeName.CREATED,
        ),
        this.sharedMessagingService.assertExchange(
          EnrollmentExchangeName.CANCELED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert enrollment exchanges", error);
      throw error;
    }
  }

  async publishCreated(enrollment: EnrollmentDto): Promise<void> {
    await this.sharedMessagingService.publish(
      EnrollmentExchangeName.CREATED,
      EnrollmentRoutingKey.CREATED,
      enrollment,
    );
  }

  async publishCanceled(enrollment: EnrollmentDto): Promise<void> {
    await this.sharedMessagingService.publish(
      EnrollmentExchangeName.CANCELED,
      EnrollmentRoutingKey.CANCELED,
      enrollment,
    );
  }
}
