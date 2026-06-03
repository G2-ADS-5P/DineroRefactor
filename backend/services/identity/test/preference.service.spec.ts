import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PreferenceService } from "@preferences/application/services/preference.service";
import { UserPreference } from "@preferences/domain/models/user-preference.entity";
import {
  PREFERENCE_REPOSITORY,
  type PreferenceRepository,
} from "@preferences/domain/repositories/preference-repository.interface";

describe("PreferenceService", () => {
  let service: PreferenceService;
  let repo: jest.Mocked<PreferenceRepository>;

  beforeEach(async () => {
    repo = {
      save: jest.fn(),
      findByUserId: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PreferenceService,
        { provide: PREFERENCE_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(PreferenceService);
  });

  it("returns existing preferences", async () => {
    repo.findByUserId.mockResolvedValueOnce(
      UserPreference.restore({
        userId: "user-1",
        defaultCurrency: "USD",
        darkMode: false,
      }),
    );

    const result = await service.getByUserId("user-1");

    expect(result.defaultCurrency).toBe("USD");
    expect(result.darkMode).toBe(false);
  });

  it("returns defaults when no preference exists", async () => {
    repo.findByUserId.mockResolvedValueOnce(null);

    const result = await service.getByUserId("user-1");

    expect(result.defaultCurrency).toBe("BRL");
    expect(result.darkMode).toBe(true);
    expect(result.userId).toBe("user-1");
  });

  it("updates currency from BRL to USD", async () => {
    repo.findByUserId.mockResolvedValueOnce(
      UserPreference.restore({
        userId: "user-1",
        defaultCurrency: "BRL",
        darkMode: true,
      }),
    );

    const result = await service.updateCurrency("user-1", "USD");

    expect(result.defaultCurrency).toBe("USD");
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid currency", async () => {
    repo.findByUserId.mockResolvedValueOnce(
      UserPreference.restore({
        userId: "user-1",
        defaultCurrency: "BRL",
        darkMode: true,
      }),
    );

    await expect(
      service.updateCurrency("user-1", "JPY"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("creates default preference for new user", async () => {
    await service.createDefault("user-1");
    expect(repo.save).toHaveBeenCalledTimes(1);
    const saved = repo.save.mock.calls[0][0];
    expect(saved.userId).toBe("user-1");
    expect(saved.defaultCurrency).toBe("BRL");
    expect(saved.darkMode).toBe(true);
  });
});
