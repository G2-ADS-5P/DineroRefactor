import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from "@nestjs/common";
import {
  IdentityExchangeName,
  IdentityRoutingKey,
} from "@shared/contracts/events/identity-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import { UserResponseDto } from "@users/application/dto/user-response.dto";

@Injectable()
export class UserMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          IdentityExchangeName.USER_CREATED,
        ),
        this.sharedMessagingService.assertExchange(
          IdentityExchangeName.USER_UPDATED,
        ),
        this.sharedMessagingService.assertExchange(
          IdentityExchangeName.USER_DELETED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert user exchanges", error);
      throw error;
    }
  }

  async publishUserCreated(user: UserResponseDto): Promise<void> {
    await this.sharedMessagingService.publish(
      IdentityExchangeName.USER_CREATED,
      IdentityRoutingKey.USER_CREATED,
      user,
    );
  }

  async publishUserUpdated(user: UserResponseDto): Promise<void> {
    await this.sharedMessagingService.publish(
      IdentityExchangeName.USER_UPDATED,
      IdentityRoutingKey.USER_UPDATED,
      user,
    );
  }

  async publishUserDeleted(user: UserResponseDto): Promise<void> {
    await this.sharedMessagingService.publish(
      IdentityExchangeName.USER_DELETED,
      IdentityRoutingKey.USER_DELETED,
      user,
    );
  }
}
