import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from "@nestjs/common";
import {
  FinancialExchangeName,
  FinancialRoutingKey,
} from "@shared/contracts/events/financial-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import type { TransactionResponseDto } from "@transactions/application/dto/transaction-response.dto";

@Injectable()
export class TransactionMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TransactionMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await Promise.all([
      this.sharedMessagingService.assertExchange(
        FinancialExchangeName.TRANSACTION_CREATED,
      ),
      this.sharedMessagingService.assertExchange(
        FinancialExchangeName.TRANSACTION_UPDATED,
      ),
      this.sharedMessagingService.assertExchange(
        FinancialExchangeName.TRANSACTION_DELETED,
      ),
    ]);
    this.logger.log("Transaction exchanges asserted");
  }

  async publishTransactionCreated(tx: TransactionResponseDto): Promise<void> {
    await this.sharedMessagingService.publish(
      FinancialExchangeName.TRANSACTION_CREATED,
      FinancialRoutingKey.TRANSACTION_CREATED,
      tx,
    );
  }

  async publishTransactionUpdated(tx: TransactionResponseDto): Promise<void> {
    await this.sharedMessagingService.publish(
      FinancialExchangeName.TRANSACTION_UPDATED,
      FinancialRoutingKey.TRANSACTION_UPDATED,
      tx,
    );
  }

  async publishTransactionDeleted(payload: {
    id: string;
    userId: string;
    deletedAt: Date;
  }): Promise<void> {
    await this.sharedMessagingService.publish(
      FinancialExchangeName.TRANSACTION_DELETED,
      FinancialRoutingKey.TRANSACTION_DELETED,
      payload,
    );
  }
}
