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
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import { DrizzleTeacherRepository } from "@users/infra/repositories/drizzle-teacher.repository";
import { DrizzleUserRepository } from "@users/infra/repositories/drizzle-user.repository";
import type { Channel, ConsumeMessage } from "amqplib";

type TeacherPayload = {
  id: string;
  name: string;
};

const EXCHANGE_TYPE = "direct";

const QUEUES = {
  teacherCreated: "user-auth.academic-teachers.created.queue",
  teacherUpdated: "user-auth.academic-teachers.updated.queue",
  teacherDeleted: "user-auth.academic-teachers.deleted.queue",
} as const;

@Injectable()
export class TeacherMessageConsumerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(TeacherMessageConsumerService.name);
  private channel?: Channel;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly teacherRepository: DrizzleTeacherRepository,
    private readonly userRepository: DrizzleUserRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.channel = await this.rabbitMQService.createChannel();

    await Promise.all([
      this.registerConsumer({
        queueName: QUEUES.teacherCreated,
        exchangeName: AcademicExchangeName.TEACHER_CREATED,
        routingKey: AcademicRoutingKey.TEACHER_CREATED,
        handler: (payload) => this.handleTeacherUpsert(payload),
      }),
      this.registerConsumer({
        queueName: QUEUES.teacherUpdated,
        exchangeName: AcademicExchangeName.TEACHER_UPDATED,
        routingKey: AcademicRoutingKey.TEACHER_UPDATED,
        handler: (payload) => this.handleTeacherUpsert(payload),
      }),
      this.registerConsumer({
        queueName: QUEUES.teacherDeleted,
        exchangeName: AcademicExchangeName.TEACHER_DELETED,
        routingKey: AcademicRoutingKey.TEACHER_DELETED,
        handler: (payload) => this.handleTeacherDelete(payload),
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

  private async handleTeacherUpsert(payload: unknown): Promise<void> {
    const teacher = payload as TeacherPayload;

    await this.teacherRepository.upsert({
      externalId: teacher.id,
      name: teacher.name,
    });
  }

  private async handleTeacherDelete(payload: unknown): Promise<void> {
    const teacher = payload as TeacherPayload;
    const localTeacher = await this.teacherRepository.findByExternalId(
      teacher.id,
    );

    if (!localTeacher) {
      return;
    }

    await this.userRepository.clearTeacherReference(localTeacher.id);
    await this.teacherRepository.deleteByExternalId(teacher.id);
  }
}
