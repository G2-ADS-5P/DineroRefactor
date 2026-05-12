import type { Student } from "@academic/students/domain/models/student.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const STUDENT_REPOSITORY = Symbol("STUDENT_REPOSITORY");

export interface StudentRepository {
  create(student: Student): Promise<void>;
  update(student: Student): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Student[]>;
  findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Student[]; total: number }>;
  findById(id: string): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
}
