import type { Category } from "@categories/domain/models/category.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const CATEGORY_REPOSITORY = Symbol("CATEGORY_REPOSITORY");

export interface CategoryRepository {
  create(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Category | null>;
  findAllByUserIdPaginated(
    userId: string,
    params: PaginationParams,
  ): Promise<{ rows: Category[]; total: number }>;
}
