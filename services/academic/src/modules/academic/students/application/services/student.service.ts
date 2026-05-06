import { CreateStudentDto } from "@academic/students/application/dto/create-student.dto";
import { StudentDto } from "@academic/students/application/dto/student.dto";
import { UpdateStudentDto } from "@academic/students/application/dto/update-student.dto";
import { StudentMessagingService } from "@academic/students/application/services/student-messaging.service";
import { Student } from "@academic/students/domain/models/student.entity";
import {
  STUDENT_REPOSITORY,
  type StudentRepository,
} from "@academic/students/domain/repositories/student-repository.interface";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class StudentService {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepository: StudentRepository,
    private readonly messagingService: StudentMessagingService,
  ) {}

  async create(dto: CreateStudentDto): Promise<void> {
    const existing = await this.studentRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const student = Student.restore(dto);
    await this.studentRepository.create(student!);

    const created = await this.studentRepository.findByEmail(dto.email);

    if (!created) {
      throw new NotFoundException("Created student not found");
    }

    await this.messagingService.publishStudentCreated(
      StudentDto.fromStudent(created)!,
    );
  }

  async edit(id: string, dto: UpdateStudentDto): Promise<void> {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    if (dto.email && dto.email !== student.email) {
      const existing = await this.studentRepository.findByEmail(dto.email);

      if (existing) {
        throw new ConflictException("Email already registered");
      }
    }

    if (dto.name) student.withName(dto.name);
    if (dto.email) student.withEmail(dto.email);
    if (dto.document) student.withDocument(dto.document);
    await this.studentRepository.update(student!);

    await this.messagingService.publishStudentUpdated(
      StudentDto.fromStudent(student)!,
    );
  }

  async remove(id: string): Promise<void> {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    await this.studentRepository.delete(id);
    await this.messagingService.publishStudentDeleted(
      StudentDto.fromStudent(student)!,
    );
  }

  async list(): Promise<StudentDto[]> {
    const response = await this.studentRepository.findAll();
    return response.map((row) => StudentDto.fromStudent(row)!);
  }

  async listPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<StudentDto>> {
    const { rows, total } =
      await this.studentRepository.findAllPaginated(params);
    return {
      data: rows.map((row) => StudentDto.fromStudent(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<StudentDto | null> {
    const response = await this.studentRepository.findById(id);
    return StudentDto.fromStudent(response);
  }

  async findByEmail(email: string): Promise<StudentDto | null> {
    const response = await this.studentRepository.findByEmail(email);
    return StudentDto.fromStudent(response);
  }
}
