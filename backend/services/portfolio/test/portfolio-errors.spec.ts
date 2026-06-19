import { BadRequestException, type ArgumentsHost } from "@nestjs/common";
import { PortfolioAccessService } from "@portfolio/application/services/portfolio-access.service";
import {
  InsufficientQuantityError,
  InvalidQuantityError,
  PortfolioDomainError,
} from "@portfolio/domain/errors/portfolio.errors";
import { PortfolioAccess } from "@portfolio/domain/models/portfolio-access.entity";
import { PortfolioAsset } from "@portfolio/domain/models/portfolio-asset.entity";
import type { PortfolioAccessRepository } from "@portfolio/domain/repositories/portfolio-access-repository.interface";
import { PortfolioExceptionFilter } from "@portfolio/infra/http/portfolio-exception.filter";

describe("Portfolio error contract", () => {
  it("reports available and requested quantities", () => {
    const position = PortfolioAsset.restore({
      id: "position-1",
      userId: "user-1",
      assetId: "asset-1",
      quantity: 9,
      averagePrice: 10,
    })!;

    expect(() => position.removePosition(10)).toThrow(
      InsufficientQuantityError,
    );

    try {
      position.removePosition(10);
    } catch (error) {
      expect(error).toMatchObject({
        code: "INSUFFICIENT_ASSET_QUANTITY",
        details: { available: 9, requested: 10 },
      });
    }
  });

  it("uses a typed error for invalid quantities", () => {
    expect(() =>
      PortfolioAsset.create({
        userId: "user-1",
        assetId: "asset-1",
        quantity: 0,
        averagePrice: 10,
      }),
    ).toThrow(InvalidQuantityError);
  });

  it("formats domain errors with code, details and correlation id", () => {
    const { filter, status, json, setHeader } = makeFilter();

    filter.catch(new InsufficientQuantityError(9, 10), makeHost());

    expect(status).toHaveBeenCalledWith(409);
    expect(setHeader).toHaveBeenCalledWith(
      "x-correlation-id",
      "correlation-test",
    );
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        code: "INSUFFICIENT_ASSET_QUANTITY",
        message: "Você possui 9 cota(s), mas tentou vender 10.",
        details: { available: 9, requested: 10 },
        path: "/v1/portfolio/transactions",
        correlationId: "correlation-test",
      }),
    );
  });

  it("converts validation errors to 422", () => {
    const { filter, status, json } = makeFilter();

    filter.catch(
      new BadRequestException({
        message: ["quantity deve ser maior que zero."],
      }),
      makeHost(),
    );

    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 422,
        code: "UNPROCESSABLE_ENTITY",
        message: "Dados inválidos.",
        details: {
          validationErrors: ["quantity deve ser maior que zero."],
        },
      }),
    );
  });
});

describe("PortfolioAccessService errors", () => {
  const repository: jest.Mocked<PortfolioAccessRepository> = {
    save: jest.fn(),
    findByUserId: jest.fn(),
  };
  const service = new PortfolioAccessService(repository);

  beforeEach(() => jest.clearAllMocks());

  it("reports access that has not been synchronized", async () => {
    repository.findByUserId.mockResolvedValueOnce(null);

    await expectCode(
      service.assertCanWrite("user-1"),
      "PORTFOLIO_ACCESS_NOT_SYNCED",
    );
  });

  it("reports an expired trial", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeAccess({
        plan: "TRIAL",
        status: "ACTIVE",
        trialEndsAt: new Date(Date.now() - 60_000),
      }),
    );

    await expectCode(service.assertCanWrite("user-1"), "TRIAL_EXPIRED");
  });

  it("reports a canceled subscription", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeAccess({ plan: "PRO", status: "CANCELED" }),
    );

    await expectCode(service.assertCanWrite("user-1"), "SUBSCRIPTION_CANCELED");
  });

  it("allows an active trial", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeAccess({
        plan: "TRIAL",
        status: "ACTIVE",
        trialEndsAt: new Date(Date.now() + 60_000),
      }),
    );

    await expect(service.assertCanWrite("user-1")).resolves.toBeUndefined();
  });

  it("reports TRIAL_EXPIRED when status is EXPIRED for a trial plan", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeAccess({
        plan: "TRIAL",
        status: "EXPIRED",
        trialEndsAt: new Date(Date.now() - 60_000),
      }),
    );

    await expectCode(service.assertCanWrite("user-1"), "TRIAL_EXPIRED");
  });

  it("reports PLAN_EXPIRED when status is EXPIRED for a PRO plan", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeAccess({
        plan: "PRO",
        status: "EXPIRED",
        planExpiresAt: new Date(Date.now() - 60_000),
      }),
    );

    await expectCode(service.assertCanWrite("user-1"), "PLAN_EXPIRED");
  });

  it("reports PLAN_EXPIRED for a PRO plan expired by date while still ACTIVE", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeAccess({
        plan: "PRO",
        status: "ACTIVE",
        planExpiresAt: new Date(Date.now() - 60_000),
      }),
    );

    await expectCode(service.assertCanWrite("user-1"), "PLAN_EXPIRED");
  });

  it("allows an active PRO plan within its expiry", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeAccess({
        plan: "PRO",
        status: "ACTIVE",
        planExpiresAt: new Date(Date.now() + 60_000),
      }),
    );

    await expect(service.assertCanWrite("user-1")).resolves.toBeUndefined();
  });

  it("allows an active PRO plan with no expiry date", async () => {
    repository.findByUserId.mockResolvedValueOnce(
      makeAccess({
        plan: "PRO",
        status: "ACTIVE",
      }),
    );

    await expect(service.assertCanWrite("user-1")).resolves.toBeUndefined();
  });
});

function makeAccess(overrides: {
  plan: "TRIAL" | "PRO";
  status: "ACTIVE" | "EXPIRED" | "CANCELED";
  trialEndsAt?: Date;
  planExpiresAt?: Date;
}): PortfolioAccess {
  return PortfolioAccess.restore({
    id: "access-1",
    userId: "user-1",
    lastEventAt: new Date(),
    ...overrides,
  })!;
}

async function expectCode(promise: Promise<void>, code: string): Promise<void> {
  try {
    await promise;
    throw new Error("Expected promise to reject");
  } catch (error) {
    expect(error).toBeInstanceOf(PortfolioDomainError);
    expect(error).toMatchObject({ code });
  }
}

const status = jest.fn();
const json = jest.fn();
const setHeader = jest.fn();

function makeFilter() {
  status.mockReturnValue({ json });
  return {
    filter: new PortfolioExceptionFilter(),
    status,
    json,
    setHeader,
  };
}

function makeHost(): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        originalUrl: "/v1/portfolio/transactions",
        url: "/v1/portfolio/transactions",
        headers: { "x-correlation-id": "correlation-test" },
      }),
      getResponse: () => ({ status, json, setHeader }),
      getNext: jest.fn(),
    }),
  } as unknown as ArgumentsHost;
}
