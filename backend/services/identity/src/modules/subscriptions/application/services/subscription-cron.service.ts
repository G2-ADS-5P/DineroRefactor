import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SubscriptionService } from "@subscriptions/application/services/subscription.service";

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpireTrials() {
    this.logger.log("Checking for expired trials...");
    await this.subscriptionService.expireOldTrials();
  }
}
