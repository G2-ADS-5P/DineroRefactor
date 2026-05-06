import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { User } from "@users/domain/models/user.entity";
import type { UserRepository } from "@users/domain/repositories/user-repository.interface";
import { teachersSchema } from "@users/infra/database/schemas/teacher.schema";
import { usersSchema } from "@users/infra/database/schemas/user.schema";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(user: User): Promise<void> {
    await this.drizzleService.db.insert(usersSchema).values({
      email: user.email,
      password: user.password,
      teacherId: user.teacherRefId ?? null,
      permissions: user.permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(user: User): Promise<void> {
    await this.drizzleService.db
      .update(usersSchema)
      .set({
        email: user.email,
        password: user.password,
        teacherId: user.teacherRefId ?? null,
        permissions: user.permissions,
        updatedAt: new Date(),
      })
      .where(eq(usersSchema.id, user.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(usersSchema)
      .where(eq(usersSchema.id, id));
  }

  async clearTeacherReference(teacherRefId: string): Promise<void> {
    await this.drizzleService.db
      .update(usersSchema)
      .set({
        teacherId: null,
        updatedAt: new Date(),
      })
      .where(eq(usersSchema.teacherId, teacherRefId));
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.drizzleService.db
      .select({
        user: usersSchema,
        teacher: teachersSchema,
      })
      .from(usersSchema)
      .leftJoin(teachersSchema, eq(usersSchema.teacherId, teachersSchema.id))
      .where(eq(usersSchema.id, id))
      .limit(1);

    return this.toEntity(result[0]?.user, result[0]?.teacher ?? null);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.drizzleService.db
      .select({
        user: usersSchema,
        teacher: teachersSchema,
      })
      .from(usersSchema)
      .leftJoin(teachersSchema, eq(usersSchema.teacherId, teachersSchema.id))
      .where(eq(usersSchema.email, email.toLowerCase()))
      .limit(1);

    return this.toEntity(result[0]?.user, result[0]?.teacher ?? null);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.drizzleService.db
      .select({
        user: usersSchema,
        teacher: teachersSchema,
      })
      .from(usersSchema)
      .leftJoin(teachersSchema, eq(usersSchema.teacherId, teachersSchema.id));

    return rows
      .map((row) => this.toEntity(row.user, row.teacher ?? null))
      .filter((user): user is User => user !== null);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: User[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select({
          user: usersSchema,
          teacher: teachersSchema,
        })
        .from(usersSchema)
        .leftJoin(teachersSchema, eq(usersSchema.teacherId, teachersSchema.id))
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(usersSchema),
    ]);

    return {
      rows: rows
        .map((row) => this.toEntity(row.user, row.teacher ?? null))
        .filter((user): user is User => user !== null),
      total: countResult.count,
    };
  }

  private toEntity(
    user?: typeof usersSchema.$inferSelect,
    teacher?: typeof teachersSchema.$inferSelect | null,
  ): User | null {
    if (!user) return null;

    return User.restore({
      id: user.id,
      email: user.email,
      password: user.password,
      teacherRefId: user.teacherId,
      teacherId: teacher?.externalId,
      teacherName: teacher?.name,
      permissions: user.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
