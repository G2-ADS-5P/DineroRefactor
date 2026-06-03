import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { User } from "@users/domain/models/user.entity";
import type { UserRepository } from "@users/domain/repositories/user-repository.interface";
import { usersSchema } from "@users/infra/database/schemas/user.schema";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(user: User): Promise<void> {
    await this.drizzleService.db.insert(usersSchema).values({
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone ?? null,
      birthDate: user.birthDate
        ? user.birthDate.toISOString().slice(0, 10)
        : null,
      location: user.location ?? null,
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
        password: user.password,
        phone: user.phone ?? null,
        birthDate: user.birthDate
          ? user.birthDate.toISOString().slice(0, 10)
          : null,
        location: user.location ?? null,
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
    const result = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, email.toLowerCase()))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.drizzleService.db.select().from(usersSchema);

    return rows
      .map((row) => this.toEntity(row))
      .filter((user): user is User => user !== null);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: User[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(usersSchema)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(usersSchema),
    ]);

    return {
      rows: rows
        .map((row) => this.toEntity(row))
        .filter((user): user is User => user !== null),
      total: countResult.count,
    };
  }

  private toEntity(row?: typeof usersSchema.$inferSelect): User | null {
    if (!row) return null;

    return User.restore({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      phone: row.phone,
      birthDate: row.birthDate ? new Date(row.birthDate) : null,
      location: row.location,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
