import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { SubscriptionMessagingService } from "@subscriptions/application/services/subscription-messaging.service";
import { SubscriptionService } from "@subscriptions/application/services/subscription.service";
import { Subscription } from "@subscriptions/domain/models/subscription.entity";
import {
  SUBSCRIPTION_REPOSITORY,
  type SubscriptionRepository,
} from "@subscriptions/domain/repositories/subscription-repository.interface";

const makeSubscription = (overrides: Partial<Parameters<typeof Subscription.restore>[0]> = {}) =>
  Subscription.restore({
    id: "sub-1",
    userId: "user-1",
    plan: "TRIAL",
    status: "ACTIVE",
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    ...overrides,
  })!;

describe("SubscriptionService", () => {
  let service: SubscriptionService;
  let mockRepo: jest.Mocked<SubscriptionRepository>;
  let mockMessaging: jest.Mocked<SubscriptionMessagingService>;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      update: jest.fn(),
      findByUserId: jest.fn(),
      findAllExpiredTrials: jest.fn(),
    };

    mockMessaging = {
      publishTrialStarted: jest.fn(),
      publishPlanActivated: jest.fn(),
      publishPlanCanceled: jest.fn(),
      publishPlanExpired: jest.fn(),
      onApplicationBootstrap: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionMessagingService>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: SUBSCRIPTION_REPOSITORY, useValue: mockRepo },
        { provide: SubscriptionMessagingService, useValue: mockMessaging },
      ],
    }).compile();

    service = moduleRef.get(SubscriptionService);
  });

  describe("startTrial", () => {
    it("creates subscription with plan=TRIAL, status=ACTIVE and trialEndsAt ~14 days from now", async () => {
      const created = makeSubscription();
      mockRepo.create.mockResolvedValueOnce(undefined);
      mockRepo.findByUserId.mockResolvedValueOnce(created);

      const before = new Date();
      const result = await service.startTrial("user-1");
      const after = new Date();

      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      const inserted: Subscription = mockRepo.create.mock.calls[0][0];
      expect(inserted.plan).toBe("TRIAL");
      expect(inserted.status).toBe("ACTIVE");
      expect(inserted.trialEndsAt).toBeDefined();
      const expectedMin = new Date(before.getTime() + 13 * 24 * 60 * 60 * 1000);
      const expectedMax = new Date(after.getTime() + 15 * 24 * 60 * 60 * 1000);
      expect(inserted.trialEndsAt!.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(inserted.trialEndsAt!.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
      expect(result.plan).toBe("TRIAL");
    });

    it("publishes subscription.trial.started with correct payload", async () => {
      const created = makeSubscription();
      mockRepo.create.mockResolvedValueOnce(undefined);
      mockRepo.findByUserId.mockResolvedValueOnce(created);

      await service.startTrial("user-1");

      expect(mockMessaging.publishTrialStarted).toHaveBeenCalledTimes(1);
      const payload = mockMessaging.publishTrialStarted.mock.calls[0][0];
      expect(payload.userId).toBe("user-1");
      expect(payload.plan).toBe("TRIAL");
      expect(payload.status).toBe("ACTIVE");
      expect(payload.occurredAt).toBeDefined();
    });
  });

  describe("activatePlan", () => {
    it("changes to plan=PRO and planExpiresAt ~30 days from now", async () => {
      const existing = makeSubscription();
      const activated = makeSubscription({ plan: "PRO", planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
      mockRepo.findByUserId
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(activated);

      const before = new Date();
      const result = await service.activatePlan("user-1");
      const after = new Date();

      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      const updated: Subscription = mockRepo.update.mock.calls[0][0];
      expect(updated.plan).toBe("PRO");
      expect(updated.status).toBe("ACTIVE");
      expect(updated.planExpiresAt).toBeDefined();
      const expectedMin = new Date(before.getTime() + 29 * 24 * 60 * 60 * 1000);
      const expectedMax = new Date(after.getTime() + 31 * 24 * 60 * 60 * 1000);
      expect(updated.planExpiresAt!.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(updated.planExpiresAt!.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
      expect(result.plan).toBe("PRO");
    });

    it("publishes subscription.plan.activated", async () => {
      const existing = makeSubscription();
      const activated = makeSubscription({ plan: "PRO" });
      mockRepo.findByUserId
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(activated);

      await service.activatePlan("user-1");

      expect(mockMessaging.publishPlanActivated).toHaveBeenCalledTimes(1);
      const payload = mockMessaging.publishPlanActivated.mock.calls[0][0];
      expect(payload.plan).toBe("PRO");
    });

    it("respects custom durationDays", async () => {
      const existing = makeSubscription();
      const activated = makeSubscription({ plan: "PRO" });
      mockRepo.findByUserId
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(activated);

      const before = new Date();
      await service.activatePlan("user-1", 60);
      const after = new Date();

      const updated: Subscription = mockRepo.update.mock.calls[0][0];
      const expectedMin = new Date(before.getTime() + 59 * 24 * 60 * 60 * 1000);
      const expectedMax = new Date(after.getTime() + 61 * 24 * 60 * 60 * 1000);
      expect(updated.planExpiresAt!.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(updated.planExpiresAt!.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });
  });

  describe("cancelPlan", () => {
    it("changes status=CANCELED and publishes plan.canceled", async () => {
      const existing = makeSubscription({ plan: "PRO" });
      const canceled = makeSubscription({ plan: "PRO", status: "CANCELED" });
      mockRepo.findByUserId
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(canceled);

      const result = await service.cancelPlan("user-1");

      const updated: Subscription = mockRepo.update.mock.calls[0][0];
      expect(updated.status).toBe("CANCELED");
      expect(mockMessaging.publishPlanCanceled).toHaveBeenCalledTimes(1);
      expect(result.status).toBe("CANCELED");
    });

    it("throws NotFoundException when user has no subscription", async () => {
      mockRepo.findByUserId.mockResolvedValueOnce(null);

      await expect(service.cancelPlan("ghost")).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("expireOldTrials", () => {
    it("marks expired trials as EXPIRED and publishes plan.expired for each", async () => {
      const sub1 = makeSubscription({ id: "sub-1", userId: "user-1" });
      const sub2 = makeSubscription({ id: "sub-2", userId: "user-2" });
      mockRepo.findAllExpiredTrials.mockResolvedValueOnce([sub1, sub2]);
      mockRepo.update.mockResolvedValue(undefined);

      await service.expireOldTrials();

      expect(mockRepo.update).toHaveBeenCalledTimes(2);
      expect(mockMessaging.publishPlanExpired).toHaveBeenCalledTimes(2);

      const firstUpdated: Subscription = mockRepo.update.mock.calls[0][0];
      expect(firstUpdated.status).toBe("EXPIRED");
    });

    it("publishes plan.expired with status=EXPIRED on the event payload", async () => {
      const sub = makeSubscription({ id: "sub-1", userId: "user-1" });
      mockRepo.findAllExpiredTrials.mockResolvedValueOnce([sub]);
      mockRepo.update.mockResolvedValue(undefined);

      await service.expireOldTrials();

      expect(mockMessaging.publishPlanExpired).toHaveBeenCalledTimes(1);
      const payload = mockMessaging.publishPlanExpired.mock.calls[0][0];
      expect(payload.status).toBe("EXPIRED");
      expect(payload.userId).toBe("user-1");
    });
  });

  describe("findByUserId", () => {
    it("returns the subscription", async () => {
      const sub = makeSubscription();
      mockRepo.findByUserId.mockResolvedValueOnce(sub);

      const result = await service.findByUserId("user-1");

      expect(result.id).toBe("sub-1");
      expect(result.userId).toBe("user-1");
    });

    it("throws NotFoundException when subscription does not exist", async () => {
      mockRepo.findByUserId.mockResolvedValueOnce(null);

      await expect(service.findByUserId("ghost")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
