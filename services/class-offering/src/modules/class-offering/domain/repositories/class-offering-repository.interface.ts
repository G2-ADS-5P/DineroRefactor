import type {
  ClassOffering,
  ClassOfferingStatus,
} from "@class-offering/domain/models/class-offering.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const CLASS_OFFERING_REPOSITORY = Symbol("CLASS_OFFERING_REPOSITORY");

export interface ClassOfferingRepository {
  create(classOffering: ClassOffering): Promise<ClassOffering>;
  findAll(): Promise<ClassOffering[]>;
  findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: ClassOffering[]; total: number }>;
  findById(id: string): Promise<ClassOffering | null>;
  updateStatus(id: string, status: ClassOfferingStatus): Promise<void>;
}
