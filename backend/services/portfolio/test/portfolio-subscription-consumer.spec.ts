import { PortfolioAccessService } from "@portfolio/application/services/portfolio-access.service";
import { PortfolioSubscriptionConsumerService } from "@portfolio/application/services/portfolio-subscription-consumer.service";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import type { ConsumeMessage } from "amqplib";

describe("PortfolioSubscriptionConsumerService", () => {
  it("publishes failed messages to the error queue before acknowledging", async () => {
    const callbacks: Array<(message: ConsumeMessage | null) => Promise<void>> =
      [];
    const channel = {
      assertExchange: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest.fn().mockResolvedValue(undefined),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn().mockImplementation((_queue, callback) => {
        callbacks.push(callback);
        return Promise.resolve({ consumerTag: "consumer-1" });
      }),
      publish: jest.fn().mockReturnValue(true),
      waitForConfirms: jest.fn().mockResolvedValue(undefined),
      ack: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const rabbitMQService = {
      createConfirmChannel: jest.fn().mockResolvedValue(channel),
    } as unknown as RabbitMQService;
    const accessService = {
      syncFromSubscriptionEvent: jest
        .fn()
        .mockRejectedValue(new Error("database unavailable")),
    } as unknown as PortfolioAccessService;
    const service = new PortfolioSubscriptionConsumerService(
      rabbitMQService,
      accessService,
    );

    await service.onApplicationBootstrap();
    await callbacks[0](makeMessage());

    expect(channel.publish).toHaveBeenCalledWith(
      "portfolio.identity-subscription.errors.exchange",
      "portfolio.identity-subscription.error",
      expect.any(Buffer),
      expect.objectContaining({
        persistent: true,
        correlationId: "correlation-test",
      }),
    );
    expect(channel.ack).toHaveBeenCalledTimes(1);
    expect(channel.waitForConfirms).toHaveBeenCalledTimes(1);

    const published = JSON.parse(
      channel.publish.mock.calls[0][2].toString(),
    ) as Record<string, unknown>;
    expect(published).toMatchObject({
      correlationId: "correlation-test",
      error: "database unavailable",
      source: {
        queue: "portfolio.identity-subscription.trial-started.queue",
      },
    });
  });
});

function makeMessage(): ConsumeMessage {
  return {
    content: Buffer.from(
      JSON.stringify({
        userId: "user-1",
        plan: "TRIAL",
        status: "ACTIVE",
        trialEndsAt: new Date(Date.now() + 60_000).toISOString(),
        planExpiresAt: null,
        occurredAt: new Date().toISOString(),
      }),
    ),
    fields: {
      consumerTag: "consumer-1",
      deliveryTag: 1,
      redelivered: false,
      exchange: "identity.subscription.trial.started.exchange",
      routingKey: "subscription.trial.started",
    },
    properties: {
      contentType: "application/json",
      contentEncoding: undefined,
      headers: {},
      deliveryMode: 2,
      priority: undefined,
      correlationId: "correlation-test",
      replyTo: undefined,
      expiration: undefined,
      messageId: undefined,
      timestamp: undefined,
      type: undefined,
      userId: undefined,
      appId: undefined,
      clusterId: undefined,
    },
  };
}
