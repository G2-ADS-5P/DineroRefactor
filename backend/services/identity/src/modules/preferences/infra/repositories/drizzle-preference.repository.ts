import { Injectable } from "@nestjs/common";
import { UserPreference } from "@preferences/domain/models/user-preference.entity";
import type { PreferenceRepository } from "@preferences/domain/repositories/preference-repository.interface";
import { userPreferencesSchema } from "@preferences/infra/database/schemas/user-preference.schema";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzlePreferenceRepository implements PreferenceRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async save(preference: UserPreference): Promise<void> {
    await this.drizzleService.db
      .insert(userPreferencesSchema)
      .values({
        userId: preference.userId,
        defaultCurrency: preference.defaultCurrency,
        darkMode: preference.darkMode,
      })
      .onConflictDoUpdate({
        target: userPreferencesSchema.userId,
        set: {
          defaultCurrency: preference.defaultCurrency,
          darkMode: preference.darkMode,
        },
      });
  }

  async findByUserId(userId: string): Promise<UserPreference | null> {
    const result = await this.drizzleService.db
      .select()
      .from(userPreferencesSchema)
      .where(eq(userPreferencesSchema.userId, userId))
      .limit(1);

    return this.toEntity(result[0]);
  }

  private toEntity(
    row?: typeof userPreferencesSchema.$inferSelect,
  ): UserPreference | null {
    if (!row) return null;

    return UserPreference.restore({
      id: row.id,
      userId: row.userId,
      defaultCurrency: row.defaultCurrency,
      darkMode: row.darkMode,
    });
  }
}
