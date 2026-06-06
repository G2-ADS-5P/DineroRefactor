import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { ActivatePlanDto } from "@subscriptions/application/dto/activate-plan.dto";
import { SubscriptionResponseDto } from "@subscriptions/application/dto/subscription-response.dto";
import { SubscriptionService } from "@subscriptions/application/services/subscription.service";

@ApiTags("subscriptions")
@ApiBearerAuth()
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get("me")
  @ApiOperation({ summary: "Consultar plano e trial do usuario autenticado" })
  async getMine(@CurrentUser() user: AuthenticatedUser) {
    const sub = await this.subscriptionService.findByUserId(user.sub);
    return SubscriptionResponseDto.from(sub);
  }

  @Post("me/activate")
  @ApiOperation({ summary: "Ativar plano PRO (mock — sem gateway real)" })
  async activate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ActivatePlanDto,
  ) {
    const sub = await this.subscriptionService.activatePlan(
      user.sub,
      dto.durationDays,
    );
    return SubscriptionResponseDto.from(sub);
  }

  @Post("me/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancelar plano" })
  async cancel(@CurrentUser() user: AuthenticatedUser) {
    const sub = await this.subscriptionService.cancelPlan(user.sub);
    return SubscriptionResponseDto.from(sub);
  }
}
