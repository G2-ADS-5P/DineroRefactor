import { OpenfinanceService } from "@openfinance/application/services/openfinance.service";
import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Public } from "@shared/infra/decorators/public.decorator";

type PluggyWebhookEvent = {
  event: "item/created" | "item/updated" | "item/error" | string;
  eventId: string;
  itemId: string;
  clientUserId?: string; // our connectionId, passed during createConnectToken
  error?: string;
};

@ApiExcludeController()
@Controller("webhooks/pluggy")
export class PluggyWebhookController {
  private readonly logger = new Logger(PluggyWebhookController.name);

  constructor(private readonly openfinanceService: OpenfinanceService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  async handle(@Body() event: PluggyWebhookEvent): Promise<{ received: boolean }> {
    this.logger.log(`Pluggy webhook received: ${event.event} | item: ${event.itemId}`);

    switch (event.event) {
      case "item/created":
      case "item/updated":
        if (event.clientUserId) {
          // clientUserId is our connectionId — sync accounts, transactions and cards
          await this.openfinanceService
            .syncByConnectionId(event.clientUserId, event.itemId)
            .catch((err: unknown) => {
              this.logger.error(
                `Failed to sync connection ${event.clientUserId}`,
                err,
              );
            });
        }
        break;

      case "item/error":
        this.logger.warn(
          `Pluggy item error | item: ${event.itemId} | ${event.error ?? "unknown error"}`,
        );
        break;

      default:
        this.logger.debug(`Unhandled Pluggy event: ${event.event}`);
    }

    // Pluggy requires 2XX within 5 seconds
    return { received: true };
  }
}
