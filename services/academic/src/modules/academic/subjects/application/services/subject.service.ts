import { CreateSubjectDto } from "@academic/subjects/application/dto/create-subject.dto";
import { SubjectDto } from "@academic/subjects/application/dto/subject.dto";
import { UpdateSubjectDto } from "@academic/subjects/application/dto/update-subject.dto";
import { SubjectMessagingService } from "@academic/subjects/application/services/subject-messaging.service";
import { Subject } from "@academic/subjects/domain/models/subject.entity";
import {
  SUBJECT_REPOSITORY,
  type SubjectRepository,
} from "@academic/subjects/domain/repositories/subject-repository.interface";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class SubjectService {
  constructor(
    @Inject(SUBJECT_REPOSITORY)
    private readonly subjectRepository: SubjectRepository,
    private readonly messagingService: SubjectMessagingService,
  ) {}

  async create(dto: CreateSubjectDto): Promise<void> {
    const existing = await this.subjectRepository.findByCode(dto.code);

    if (existing) {
      throw new ConflictException("Code already registered");
    }

    const subject = Subject.restore(dto);
    await this.subjectRepository.create(subject!);

    const created = await this.subjectRepository.findByCode(dto.code);

    if (!created) {
      throw new NotFoundException("Created subject not found");
    }

    await this.messagingService.publishSubjectCreated(
      SubjectDto.from(created)!,
    );
  }

  async edit(id: string, dto: UpdateSubjectDto): Promise<void> {
    const subject = await this.subjectRepository.findById(id);

    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    if (dto.code && dto.code !== subject.code) {
      const existing = await this.subjectRepository.findByCode(dto.code);

      if (existing) {
        throw new ConflictException("Code already registered");
      }
    }

    if (dto.name) subject.withName(dto.name);
    if (dto.code) subject.withCode(dto.code);
    if (dto.workload) subject.withWorkload(dto.workload);
    if (dto.description) subject.withDescription(dto.description);

    await this.subjectRepository.update(subject);
    await this.messagingService.publishSubjectUpdated(
      SubjectDto.from(subject)!,
    );
  }

  async remove(id: string): Promise<void> {
    const subject = await this.subjectRepository.findById(id);

    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    await this.subjectRepository.delete(id);
    await this.messagingService.publishSubjectDeleted(
      SubjectDto.from(subject)!,
    );
  }

  async list(): Promise<SubjectDto[]> {
    const response = await this.subjectRepository.findAll();
    return response.map((row) => SubjectDto.from(row)!);
  }

  async listPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<SubjectDto>> {
    const { rows, total } =
      await this.subjectRepository.findAllPaginated(params);
    return {
      data: rows.map((row) => SubjectDto.from(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<SubjectDto | null> {
    const response = await this.subjectRepository.findById(id);
    return SubjectDto.from(response);
  }

  async findByCode(code: string): Promise<SubjectDto | null> {
    const response = await this.subjectRepository.findByCode(code);
    return SubjectDto.from(response);
  }
}
