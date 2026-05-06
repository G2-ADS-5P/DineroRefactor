import type { Subject } from "@academic/subjects/domain/models/subject.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const SUBJECT_REPOSITORY = Symbol("SUBJECT_REPOSITORY");

export interface SubjectRepository {
  create(subject: Subject): Promise<void>;
  update(subject: Subject): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Subject[]>;
  findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Subject[]; total: number }>;
  findById(id: string): Promise<Subject | null>;
  findByCode(code: string): Promise<Subject | null>;
}
