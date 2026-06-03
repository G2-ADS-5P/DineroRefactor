import type { User } from "@users/domain/models/user.entity";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepository {
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByExternalId(externalId: string): Promise<User | null>;
}
