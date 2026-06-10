import { Injectable } from "@nestjs/common";
import {
  PortfolioAccess,
  type PortfolioAccessPlan,
  type PortfolioAccessStatus,
} from "@portfolio/domain/models/portfolio-access.entity";
import type { PortfolioAccessRepository } from "@portfolio/domain/repositories/portfolio-access-repository.interface";
import { portfolioAccessSchema } from "@portfolio/infra/database/schemas/portfolio-access.schema";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzlePortfolioAccessRepository
  implements PortfolioAccessRepository
{
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(access: PortfolioAccess): Promise<PortfolioAccess> {
    const now = new Date();
    const [row] = await this.drizzleService.db
      .insert(portfolioAccessSchema)
      .values({
        userId: access.userId,
        plan: access.plan,
        status: access.status,
        trialEndsAt: access.trialEndsAt ?? null,
        planExpiresAt: access.planExpiresAt ?? null,
        lastEventAt: access.lastEventAt,
        createdAt: access.createdAt ?? now,
        updatedAt: access.updatedAt ?? now,
      })
      .onConflictDoUpdate({
        target: portfolioAccessSchema.userId,
        set: {
          plan: access.plan,
          status: access.status,
          trialEndsAt: access.trialEndsAt ?? null,
          planExpiresAt: access.planExpiresAt ?? null,
          lastEventAt: access.lastEventAt,
          updatedAt: now,
        },
      })
      .returning();

    return this.toDomain(row);
  }

  async findByUserId(userId: string): Promise<PortfolioAccess | null> {
    const rows = await this.drizzleService.db
      .select()
      .from(portfolioAccessSchema)
      .where(eq(portfolioAccessSchema.userId, userId))
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  private toDomain(
    row: typeof portfolioAccessSchema.$inferSelect,
  ): PortfolioAccess {
    return PortfolioAccess.restore({
      ...row,
      plan: row.plan as PortfolioAccessPlan,
      status: row.status as PortfolioAccessStatus,
    })!;
  }
}
