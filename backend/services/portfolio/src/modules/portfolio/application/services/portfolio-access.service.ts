import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { PortfolioAccessResponseDto } from "@portfolio/application/dto/portfolio-access-response.dto";
import type { SubscriptionEventDto } from "@portfolio/application/dto/subscription-event.dto";
import { PortfolioAccess } from "@portfolio/domain/models/portfolio-access.entity";
import {
  PORTFOLIO_ACCESS_REPOSITORY,
  type PortfolioAccessRepository,
} from "@portfolio/domain/repositories/portfolio-access-repository.interface";

@Injectable()
export class PortfolioAccessService {
  constructor(
    @Inject(PORTFOLIO_ACCESS_REPOSITORY)
    private readonly accessRepository: PortfolioAccessRepository,
  ) {}

  async syncFromSubscriptionEvent(dto: SubscriptionEventDto): Promise<void> {
    const occurredAt = new Date(dto.occurredAt);
    const existing = await this.accessRepository.findByUserId(dto.userId);

    if (existing?.isNewerThan(occurredAt)) return;

    const access = PortfolioAccess.restore({
      userId: dto.userId,
      plan: dto.plan,
      status: dto.status,
      trialEndsAt: this.toDate(dto.trialEndsAt),
      planExpiresAt: this.toDate(dto.planExpiresAt),
      lastEventAt: occurredAt,
    })!;

    await this.accessRepository.save(access);
  }

  async assertCanWrite(userId: string): Promise<void> {
    const access = await this.accessRepository.findByUserId(userId);

    if (!access?.canWrite()) {
      throw new ForbiddenException(
        "Portfolio write access is not active for this user",
      );
    }
  }

  async getAccessStatus(userId: string): Promise<PortfolioAccessResponseDto> {
    const access = await this.accessRepository.findByUserId(userId);

    return new PortfolioAccessResponseDto({
      plan: access?.plan ?? null,
      status: access?.status ?? null,
      canWrite: access?.canWrite() ?? false,
      trialEndsAt: access?.trialEndsAt?.toISOString() ?? null,
      planExpiresAt: access?.planExpiresAt?.toISOString() ?? null,
    });
  }

  private toDate(value: string | null): Date | undefined {
    return value ? new Date(value) : undefined;
  }
}
