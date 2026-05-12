import type { Teacher } from "@academic/teachers/domain/models/teacher.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const TEACHER_REPOSITORY = Symbol("TEACHER_REPOSITORY");

export interface TeacherRepository {
  create(teacher: Teacher): Promise<void>;
  update(teacher: Teacher): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Teacher[]>;
  findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Teacher[]; total: number }>;
  findById(id: string): Promise<Teacher | null>;
  findByEmail(email: string): Promise<Teacher | null>;
}
