import type { PaginationParams } from "@shared/infra/hateoas";
import type { User } from "@users/domain/models/user.entity";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepository {
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
  findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
