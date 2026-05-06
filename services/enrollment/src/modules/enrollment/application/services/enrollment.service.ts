import { EnrollmentDto } from "@enrollment/application/dto/enrollment.dto";
import { EnrollmentMessagingService } from "@enrollment/application/services/enrollment-messaging.service";
import {
  Enrollment,
  EnrollmentStatus,
} from "@enrollment/domain/models/enrollment.entity";
import {
  ENROLLMENT_REPOSITORY,
  type EnrollmentRepository,
} from "@enrollment/domain/repositories/enrollment-repository.interface";
import { DrizzleClassOfferingRepository } from "@enrollment/infra/repositories/drizzle-class-offering.repository";
import { DrizzleStudentRepository } from "@enrollment/infra/repositories/drizzle-student.repository";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult } from "@shared/infra/hateoas";

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly studentRepository: DrizzleStudentRepository,
    private readonly classOfferingRepository: DrizzleClassOfferingRepository,
    private readonly enrollmentMessagingService: EnrollmentMessagingService,
  ) {}

  async enroll(dto: {
    studentId: string;
    studentName: string;
    classOfferingId: string;
    classOfferingStartDate: Date;
    classOfferingEndDate: Date;
    classOfferingStatus: "active" | "inactive";
  }): Promise<void> {
    const student = await this.studentRepository.upsert({
      externalId: dto.studentId,
      name: dto.studentName,
    });

    const classOffering = await this.classOfferingRepository.upsert({
      externalId: dto.classOfferingId,
      startDate: new Date(dto.classOfferingStartDate),
      endDate: new Date(dto.classOfferingEndDate),
      status: dto.classOfferingStatus,
    });

    const existing =
      await this.enrollmentRepository.findByStudentAndClassOffering(
        student.id,
        classOffering.id,
      );

    if (existing) {
      throw new ConflictException(
        "Student is already enrolled in this class offering",
      );
    }

    const enrollment = Enrollment.restore({
      studentRefId: student.id,
      studentId: dto.studentId,
      classOfferingRefId: classOffering.id,
      classOfferingId: dto.classOfferingId,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: new Date(),
    });

    const created = await this.enrollmentRepository.create(enrollment!);
    await this.enrollmentMessagingService.publishCreated(
      EnrollmentDto.from(created)!,
    );
  }

  async cancel(id: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    await this.enrollmentRepository.cancel(id);
    enrollment.withStatus(EnrollmentStatus.CANCELED);
    enrollment.withCanceledAt(new Date());
    await this.enrollmentMessagingService.publishCanceled(
      EnrollmentDto.from(enrollment)!,
    );
  }

  async listByClassOffering(
    classOfferingId: string,
  ): Promise<PaginatedResult<EnrollmentDto>> {
    const classOffering =
      await this.classOfferingRepository.findByExternalId(classOfferingId);

    if (!classOffering) {
      return { data: [], total: 0, page: 1, limit: 1 };
    }

    const response = await this.enrollmentRepository.findByClassOfferingId(
      classOffering.id,
    );
    const data = response.map((row) => EnrollmentDto.from(row)!);
    return { data, total: data.length, page: 1, limit: data.length || 1 };
  }
}
