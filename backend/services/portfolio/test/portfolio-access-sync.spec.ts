import type { SubscriptionEventDto } from "@portfolio/application/dto/subscription-event.dto";
import { PortfolioAccessService } from "@portfolio/application/services/portfolio-access.service";
import { PortfolioAccess } from "@portfolio/domain/models/portfolio-access.entity";
import type { PortfolioAccessRepository } from "@portfolio/domain/repositories/portfolio-access-repository.interface";

describe("PortfolioAccessService.syncFromSubscriptionEvent", () => {
  const repository: jest.Mocked<PortfolioAccessRepository> = {
    save: jest.fn(),
    findByUserId: jest.fn(),
  };
  const service = new PortfolioAccessService(repository);

  beforeEach(() => jest.clearAllMocks());

  it("creates the access record on the first event for a user", async () => {
    repository.findByUserId.mockResolvedValueOnce(null);

    const dto = makeDto({ plan: "TRIAL", status: "ACTIVE" });
    await service.syncFromSubscriptionEvent(dto);

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.userId).toBe(dto.userId);
    expect(saved.plan).toBe("TRIAL");
    expect(saved.status).toBe("ACTIVE");
  });

  it("overwrites the existing record when the event is newer", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeExisting(new Date(Date.now() - 5 * 60_000)),
    );

    const dto = makeDto({ occurredAt: new Date().toISOString() });
    await service.syncFromSubscriptionEvent(dto);

    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("ignores an older event for idempotency", async () => {
    repository.findByUserId.mockResolvedValueOnce(makeExisting(new Date()));

    const dto = makeDto({
      occurredAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    });
    await service.syncFromSubscriptionEvent(dto);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("sets plan=PRO and planExpiresAt for a PLAN_ACTIVATED event", async () => {
    repository.findByUserId.mockResolvedValueOnce(null);

    const planExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const dto = makeDto({
      plan: "PRO",
      status: "ACTIVE",
      trialEndsAt: null,
      planExpiresAt,
    });
    await service.syncFromSubscriptionEvent(dto);

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.plan).toBe("PRO");
    expect(saved.planExpiresAt).toBeInstanceOf(Date);
    expect(saved.planExpiresAt?.toISOString()).toBe(planExpiresAt);
  });

  it("sets status=CANCELED for a PLAN_CANCELED event", async () => {
    repository.findByUserId.mockResolvedValueOnce(null);

    const dto = makeDto({ plan: "PRO", status: "CANCELED" });
    await service.syncFromSubscriptionEvent(dto);

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.status).toBe("CANCELED");
  });

  it("sets status=EXPIRED for a PLAN_EXPIRED event", async () => {
    repository.findByUserId.mockResolvedValueOnce(null);

    const dto = makeDto({ plan: "TRIAL", status: "EXPIRED" });
    await service.syncFromSubscriptionEvent(dto);

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.status).toBe("EXPIRED");
  });
});

function makeDto(
  overrides: Partial<SubscriptionEventDto> = {},
): SubscriptionEventDto {
  return {
    userId: "user-1",
    plan: "TRIAL",
    status: "ACTIVE",
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    planExpiresAt: null,
    occurredAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeExisting(lastEventAt: Date): PortfolioAccess {
  return PortfolioAccess.restore({
    id: "access-1",
    userId: "user-1",
    plan: "TRIAL",
    status: "ACTIVE",
    lastEventAt,
  })!;
}
