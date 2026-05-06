import type { EnrollmentClassOfferingStatus } from "@enrollment/infra/database/schemas/class-offering.schema";
import { DrizzleClassOfferingRepository } from "@enrollment/infra/repositories/drizzle-class-offering.repository";
import { DrizzleStudentRepository } from "@enrollment/infra/repositories/drizzle-student.repository";
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from "@nestjs/common";
import {
  AcademicExchangeName,
  AcademicRoutingKey,
} from "@shared/contracts/events/academic-events.enum";
import {
  ClassOfferingExchangeName,
  ClassOfferingRoutingKey,
} from "@shared/contracts/events/class-offering-events.enum";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import type { Channel, ConsumeMessage } from "amqplib";

type StudentPayload = {
  id: string;
  name: string;
};

type ClassOfferingPayload = {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  status: EnrollmentClassOfferingStatus;
};

const EXCHANGE_TYPE = "direct";

const QUEUES = {
  studentCreated: "enrollment.academic-students.created.queue",
  studentUpdated: "enrollment.academic-students.updated.queue",
  studentDeleted: "enrollment.academic-students.deleted.queue",
  classOfferingCreated: "enrollment.class-offering.created.queue",
  classOfferingUpdated: "enrollment.class-offering.updated.queue",
  classOfferingCanceled: "enrollment.class-offering.canceled.queue",
} as const;

@Injectable()
export class EnrollmentMessageConsumerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(EnrollmentMessageConsumerService.name);
  private channel?: Channel;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly studentRepository: DrizzleStudentRepository,
    private readonly classOfferingRepository: DrizzleClassOfferingRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.channel = await this.rabbitMQService.createChannel();

    await Promise.all([
      this.registerConsumer({
        queueName: QUEUES.studentCreated,
        exchangeName: AcademicExchangeName.STUDENT_CREATED,
        routingKey: AcademicRoutingKey.STUDENT_CREATED,
        handler: (payload) => this.handleStudentUpsert(payload),
      }),
      this.registerConsumer({
        queueName: QUEUES.studentUpdated,
        exchangeName: AcademicExchangeName.STUDENT_UPDATED,
        routingKey: AcademicRoutingKey.STUDENT_UPDATED,
        handler: (payload) => this.handleStudentUpsert(payload),
      }),
      this.registerConsumer({
        queueName: QUEUES.studentDeleted,
        exchangeName: AcademicExchangeName.STUDENT_DELETED,
        routingKey: AcademicRoutingKey.STUDENT_DELETED,
        handler: (payload) => this.handleStudentDelete(payload),
      }),
      this.registerConsumer({
        queueName: QUEUES.classOfferingCreated,
        exchangeName: ClassOfferingExchangeName.CREATED,
        routingKey: ClassOfferingRoutingKey.CREATED,
        handler: (payload) => this.handleClassOfferingUpsert(payload),
      }),
      this.registerConsumer({
        queueName: QUEUES.classOfferingUpdated,
        exchangeName: ClassOfferingExchangeName.UPDATED,
        routingKey: ClassOfferingRoutingKey.UPDATED,
        handler: (payload) => this.handleClassOfferingUpsert(payload),
      }),
      this.registerConsumer({
        queueName: QUEUES.classOfferingCanceled,
        exchangeName: ClassOfferingExchangeName.CANCELED,
        routingKey: ClassOfferingRoutingKey.CANCELED,
        handler: (payload) => this.handleClassOfferingUpsert(payload),
      }),
    ]);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
  }

  private async registerConsumer(params: {
    queueName: string;
    exchangeName: string;
    routingKey: string;
    handler: (payload: unknown) => Promise<void>;
  }): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ consumer channel not initialized");
    }

    await this.channel.assertExchange(params.exchangeName, EXCHANGE_TYPE, {
      durable: true,
    });
    await this.channel.assertQueue(params.queueName, { durable: true });
    await this.channel.bindQueue(
      params.queueName,
      params.exchangeName,
      params.routingKey,
    );

    await this.channel.consume(params.queueName, async (msg) => {
      await this.consumeMessage(params.queueName, msg, params.handler);
    });

    this.logger.log(`Consumer registered on queue "${params.queueName}"`);
  }

  private async consumeMessage(
    queueName: string,
    msg: ConsumeMessage | null,
    handler: (payload: unknown) => Promise<void>,
  ): Promise<void> {
    if (!msg || !this.channel) return;

    try {
      const payload = JSON.parse(msg.content.toString()) as unknown;
      await handler(payload);
      this.channel.ack(msg);
      this.logger.log(`Message consumed from queue "${queueName}"`);
    } catch (error) {
      this.logger.error(
        `Failed to process message from queue "${queueName}"`,
        error,
      );
      this.channel.nack(msg, false, false);
    }
  }

  private async handleStudentUpsert(payload: unknown): Promise<void> {
    const student = payload as StudentPayload;

    await this.studentRepository.upsert({
      externalId: student.id,
      name: student.name,
    });
  }

  private async handleStudentDelete(payload: unknown): Promise<void> {
    const student = payload as StudentPayload;
    await this.studentRepository.deleteByExternalId(student.id);
  }

  private async handleClassOfferingUpsert(payload: unknown): Promise<void> {
    const classOffering = payload as ClassOfferingPayload;

    await this.classOfferingRepository.upsert({
      externalId: classOffering.id,
      startDate: new Date(classOffering.startDate),
      endDate: new Date(classOffering.endDate),
      status: classOffering.status,
    });
  }
}
