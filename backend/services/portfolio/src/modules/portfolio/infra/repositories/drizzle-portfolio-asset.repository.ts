import { Injectable } from "@nestjs/common";
import { PortfolioAsset } from "@portfolio/domain/models/portfolio-asset.entity";
import type { PortfolioAssetRepository } from "@portfolio/domain/repositories/portfolio-asset-repository.interface";
import { portfolioAssetsSchema } from "@portfolio/infra/database/schemas/portfolio-asset.schema";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { and, eq } from "drizzle-orm";

@Injectable()
export class DrizzlePortfolioAssetRepository
  implements PortfolioAssetRepository
{
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(portfolioAsset: PortfolioAsset): Promise<PortfolioAsset> {
    const now = new Date();
    const [row] = await this.drizzleService.db
      .insert(portfolioAssetsSchema)
      .values({
        userId: portfolioAsset.userId,
        assetId: portfolioAsset.assetId,
        quantity: portfolioAsset.quantity,
        averagePrice: portfolioAsset.averagePrice,
        createdAt: portfolioAsset.createdAt ?? now,
        updatedAt: portfolioAsset.updatedAt ?? now,
      })
      .onConflictDoUpdate({
        target: [portfolioAssetsSchema.userId, portfolioAssetsSchema.assetId],
        set: {
          quantity: portfolioAsset.quantity,
          averagePrice: portfolioAsset.averagePrice,
          updatedAt: portfolioAsset.updatedAt ?? now,
        },
      })
      .returning();

    return this.toDomain(row);
  }

  async findById(id: string): Promise<PortfolioAsset | null> {
    const result = await this.drizzleService.db
      .select()
      .from(portfolioAssetsSchema)
      .where(eq(portfolioAssetsSchema.id, id))
      .limit(1);

    return result[0] ? this.toDomain(result[0]) : null;
  }

  async findByUserAndAsset(
    userId: string,
    assetId: string,
  ): Promise<PortfolioAsset | null> {
    const result = await this.drizzleService.db
      .select()
      .from(portfolioAssetsSchema)
      .where(
        and(
          eq(portfolioAssetsSchema.userId, userId),
          eq(portfolioAssetsSchema.assetId, assetId),
        ),
      )
      .limit(1);

    return result[0] ? this.toDomain(result[0]) : null;
  }

  async findAllByUserId(userId: string): Promise<PortfolioAsset[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(portfolioAssetsSchema)
      .where(eq(portfolioAssetsSchema.userId, userId));

    return rows.map((row) => this.toDomain(row));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(portfolioAssetsSchema)
      .where(eq(portfolioAssetsSchema.id, id));
  }

  private toDomain(row: typeof portfolioAssetsSchema.$inferSelect) {
    return PortfolioAsset.restore(row)!;
  }
}
