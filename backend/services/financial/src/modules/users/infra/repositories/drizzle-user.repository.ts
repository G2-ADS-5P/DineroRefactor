import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { User } from "@users/domain/models/user.entity";
import type { UserRepository } from "@users/domain/repositories/user-repository.interface";
import { usersSchema } from "@users/infra/database/schemas/user.schema";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(user: User): Promise<void> {
    await this.drizzleService.db.insert(usersSchema).values({
      externalId: user.externalId,
      name: user.name,
      email: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(user: User): Promise<void> {
    await this.drizzleService.db
      .update(usersSchema)
      .set({
        name: user.name,
        email: user.email,
        updatedAt: new Date(),
      })
      .where(eq(usersSchema.id, user.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(usersSchema)
      .where(eq(usersSchema.id, id));
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id))
      .limit(1);

    return this.toEntity(row);
  }

  async findByExternalId(externalId: string): Promise<User | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.externalId, externalId))
      .limit(1);

    return this.toEntity(row);
  }

  private toEntity(row?: typeof usersSchema.$inferSelect): User | null {
    if (!row) return null;

    return User.restore({
      id: row.id,
      externalId: row.externalId,
      name: row.name,
      email: row.email,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
