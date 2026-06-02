import type { UserPreference } from "@preferences/domain/models/user-preference.entity";

export const PREFERENCE_REPOSITORY = Symbol("PREFERENCE_REPOSITORY");

export interface PreferenceRepository {
  save(preference: UserPreference): Promise<void>;
  findByUserId(userId: string): Promise<UserPreference | null>;
}
