import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  OpenfinanceExchangeName,
  OpenfinanceRoutingKey,
} from "@shared/contracts/events/openfinance-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import type { BankConnectionDto } from "@openfinance/application/dto/bank-connection.dto";

@Injectable()
export class OpenfinanceMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(OpenfinanceMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          OpenfinanceExchangeName.BANK_CONNECTION_CREATED,
        ),
        this.sharedMessagingService.assertExchange(
          OpenfinanceExchangeName.BANK_CONNECTION_REVOKED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert openfinance exchanges", error);
      throw error;
    }
  }

  async publishBankConnectionCreated(
    bankConnection: BankConnectionDto,
  ): Promise<void> {
    await this.sharedMessagingService.publish(
      OpenfinanceExchangeName.BANK_CONNECTION_CREATED,
      OpenfinanceRoutingKey.BANK_CONNECTION_CREATED,
      bankConnection,
    );
  }

  async publishBankConnectionRevoked(
    bankConnection: BankConnectionDto,
  ): Promise<void> {
    await this.sharedMessagingService.publish(
      OpenfinanceExchangeName.BANK_CONNECTION_REVOKED,
      OpenfinanceRoutingKey.BANK_CONNECTION_REVOKED,
      bankConnection,
    );
  }
}
