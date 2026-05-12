import { ClassOfferingDto } from "@class-offering/application/dto/class-offering.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  ClassOfferingExchangeName,
  ClassOfferingRoutingKey,
} from "@shared/contracts/events/class-offering-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class ClassOfferingMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ClassOfferingMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          ClassOfferingExchangeName.CREATED,
        ),
        this.sharedMessagingService.assertExchange(
          ClassOfferingExchangeName.UPDATED,
        ),
        this.sharedMessagingService.assertExchange(
          ClassOfferingExchangeName.CANCELED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert class-offering exchanges", error);
      throw error;
    }
  }

  async publishCreated(classOffering: ClassOfferingDto): Promise<void> {
    await this.sharedMessagingService.publish(
      ClassOfferingExchangeName.CREATED,
      ClassOfferingRoutingKey.CREATED,
      classOffering,
    );
  }

  async publishUpdated(classOffering: ClassOfferingDto): Promise<void> {
    await this.sharedMessagingService.publish(
      ClassOfferingExchangeName.UPDATED,
      ClassOfferingRoutingKey.UPDATED,
      classOffering,
    );
  }

  async publishCanceled(classOffering: ClassOfferingDto): Promise<void> {
    await this.sharedMessagingService.publish(
      ClassOfferingExchangeName.CANCELED,
      ClassOfferingRoutingKey.CANCELED,
      classOffering,
    );
  }
}
