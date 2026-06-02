import { Category } from "@categories/domain/models/category.entity";
import type { CategoryRepository } from "@categories/domain/repositories/category-repository.interface";
import { categoriesSchema } from "@categories/infra/database/schemas/category.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { and, eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleCategoryRepository implements CategoryRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(category: Category): Promise<void> {
    await this.drizzleService.db.insert(categoriesSchema).values({
      userId: category.userId,
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      parentId: category.parentId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(category: Category): Promise<void> {
    await this.drizzleService.db
      .update(categoriesSchema)
      .set({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        parentId: category.parentId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(categoriesSchema.id, category.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(categoriesSchema)
      .where(eq(categoriesSchema.id, id));
  }

  async findById(id: string): Promise<Category | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(categoriesSchema)
      .where(eq(categoriesSchema.id, id))
      .limit(1);

    return this.toEntity(row);
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Category | null> {
    const [row] = await this.drizzleService.db
      .select()
      .from(categoriesSchema)
      .where(
        and(eq(categoriesSchema.id, id), eq(categoriesSchema.userId, userId)),
      )
      .limit(1);

    return this.toEntity(row);
  }

  async findAllByUserIdPaginated(
    userId: string,
    params: PaginationParams,
  ): Promise<{ rows: Category[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(categoriesSchema)
        .where(eq(categoriesSchema.userId, userId))
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(categoriesSchema)
        .where(eq(categoriesSchema.userId, userId)),
    ]);

    return {
      rows: rows
        .map((r) => this.toEntity(r))
        .filter((c): c is Category => c !== null),
      total: countResult.count,
    };
  }

  private toEntity(
    row?: typeof categoriesSchema.$inferSelect,
  ): Category | null {
    if (!row) return null;

    return Category.restore({
      id: row.id,
      userId: row.userId,
      name: row.name,
      type: row.type,
      color: row.color,
      icon: row.icon,
      parentId: row.parentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
