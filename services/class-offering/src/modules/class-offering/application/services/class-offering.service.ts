import { ClassOfferingDto } from "@class-offering/application/dto/class-offering.dto";
import { ClassOfferingMessagingService } from "@class-offering/application/services/class-offering-messaging.service";
import {
  ClassOffering,
  ClassOfferingStatus,
} from "@class-offering/domain/models/class-offering.entity";
import {
  CLASS_OFFERING_REPOSITORY,
  type ClassOfferingRepository,
} from "@class-offering/domain/repositories/class-offering-repository.interface";
import { DrizzleSubjectRepository } from "@class-offering/infra/repositories/drizzle-subject.repository";
import { DrizzleTeacherRepository } from "@class-offering/infra/repositories/drizzle-teacher.repository";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class ClassOfferingService {
  constructor(
    @Inject(CLASS_OFFERING_REPOSITORY)
    private readonly classOfferingRepository: ClassOfferingRepository,
    private readonly subjectRepository: DrizzleSubjectRepository,
    private readonly teacherRepository: DrizzleTeacherRepository,
    private readonly classOfferingMessagingService: ClassOfferingMessagingService,
  ) {}

  async create(dto: {
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    startDate: Date;
    endDate: Date;
  }): Promise<void> {
    const subject = await this.subjectRepository.upsert({
      externalId: dto.subjectId,
      name: dto.subjectName,
    });

    const teacher = await this.teacherRepository.upsert({
      externalId: dto.teacherId,
      name: dto.teacherName,
    });

    const classOffering = ClassOffering.restore({
      subjectRefId: subject.id,
      subjectId: dto.subjectId,
      subjectName: dto.subjectName,
      teacherRefId: teacher.id,
      teacherId: dto.teacherId,
      teacherName: dto.teacherName,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: ClassOfferingStatus.ACTIVE,
    });

    const created = await this.classOfferingRepository.create(classOffering!);
    await this.classOfferingMessagingService.publishCreated(
      ClassOfferingDto.from(created)!,
    );
  }

  async list(): Promise<ClassOfferingDto[]> {
    const response = await this.classOfferingRepository.findAll();
    return response.map((row) => ClassOfferingDto.from(row)!);
  }

  async listPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<ClassOfferingDto>> {
    const { rows, total } =
      await this.classOfferingRepository.findAllPaginated(params);
    return {
      data: rows.map((row) => ClassOfferingDto.from(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<ClassOfferingDto | null> {
    const response = await this.classOfferingRepository.findById(id);
    return ClassOfferingDto.from(response);
  }

  async changeStatus(id: string, status: ClassOfferingStatus): Promise<void> {
    const classOffering = await this.classOfferingRepository.findById(id);

    if (!classOffering) {
      throw new NotFoundException("ClassOffering not found");
    }

    await this.classOfferingRepository.updateStatus(id, status);
    classOffering.withStatus(status);

    if (status === ClassOfferingStatus.INACTIVE) {
      await this.classOfferingMessagingService.publishCanceled(
        ClassOfferingDto.from(classOffering)!,
      );
      return;
    }

    await this.classOfferingMessagingService.publishUpdated(
      ClassOfferingDto.from(classOffering)!,
    );
  }
}
