import { AttendanceDto } from "@attendance/application/dto/attendance.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  AttendanceExchangeName,
  AttendanceRoutingKey,
} from "@shared/contracts/events/attendance-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class AttendanceMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AttendanceMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.sharedMessagingService.assertExchange(
        AttendanceExchangeName.REGISTERED,
      );
    } catch (error) {
      this.logger.error("Failed to assert attendance exchanges", error);
      throw error;
    }
  }

  async publishRegistered(attendance: AttendanceDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AttendanceExchangeName.REGISTERED,
      AttendanceRoutingKey.REGISTERED,
      attendance,
    );
  }
}
