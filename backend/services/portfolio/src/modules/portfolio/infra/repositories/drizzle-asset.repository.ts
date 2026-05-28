import { Injectable } from "@nestjs/common";
import { Asset, type AssetType } from "@portfolio/domain/models/asset.entity";
import type {
  AssetRepository,
  AssetSearchParams,
} from "@portfolio/domain/repositories/asset-repository.interface";
import { assetsSchema } from "@portfolio/infra/database/schemas/asset.schema";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

@Injectable()
export class DrizzleAssetRepository implements AssetRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(asset: Asset): Promise<Asset> {
    const now = new Date();
    const [row] = await this.drizzleService.db
      .insert(assetsSchema)
      .values({
        ticker: asset.ticker,
        name: asset.name,
        type: asset.type,
        createdAt: asset.createdAt ?? now,
      })
      .onConflictDoUpdate({
        target: assetsSchema.ticker,
        set: {
          name: asset.name,
          type: asset.type,
        },
      })
      .returning();

    return this.toDomain(row);
  }

  async findById(id: string): Promise<Asset | null> {
    const result = await this.drizzleService.db
      .select()
      .from(assetsSchema)
      .where(eq(assetsSchema.id, id))
      .limit(1);

    return result[0] ? this.toDomain(result[0]) : null;
  }

  async findByTicker(ticker: string): Promise<Asset | null> {
    const result = await this.drizzleService.db
      .select()
      .from(assetsSchema)
      .where(eq(assetsSchema.ticker, ticker.toUpperCase()))
      .limit(1);

    return result[0] ? this.toDomain(result[0]) : null;
  }

  async findAll(): Promise<Asset[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(assetsSchema)
      .orderBy(asc(assetsSchema.ticker));

    return rows.map((row) => this.toDomain(row));
  }

  async findAllPaginated(
    params: AssetSearchParams,
  ): Promise<{ rows: Asset[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const filters = [];

    if (params.type) {
      filters.push(eq(assetsSchema.type, params.type));
    }

    if (params.search) {
      const search = `%${params.search}%`;
      filters.push(
        or(
          ilike(assetsSchema.ticker, search),
          ilike(assetsSchema.name, search),
        ),
      );
    }

    const where = filters.length > 0 ? and(...filters) : undefined;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(assetsSchema)
        .where(where)
        .orderBy(asc(assetsSchema.ticker))
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(assetsSchema)
        .where(where),
    ]);

    return {
      rows: rows.map((row) => this.toDomain(row)),
      total: countResult.count,
    };
  }

  private toDomain(row: typeof assetsSchema.$inferSelect): Asset {
    return Asset.restore({
      ...row,
      type: row.type as AssetType,
    })!;
  }
}
