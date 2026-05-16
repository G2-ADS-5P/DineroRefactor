import { Module } from "@nestjs/common";
import { PreferenceService } from "@preferences/application/services/preference.service";
import { PREFERENCE_REPOSITORY } from "@preferences/domain/repositories/preference-repository.interface";
import { PreferencesController } from "@preferences/infra/controllers/preferences.controller";
import { DrizzlePreferenceRepository } from "@preferences/infra/repositories/drizzle-preference.repository";

@Module({
  controllers: [PreferencesController],
  providers: [
    PreferenceService,
    DrizzlePreferenceRepository,
    {
      provide: PREFERENCE_REPOSITORY,
      useExisting: DrizzlePreferenceRepository,
    },
  ],
  exports: [PreferenceService],
})
export class PreferencesModule {}
