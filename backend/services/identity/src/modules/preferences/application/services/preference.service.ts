import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PreferenceResponseDto } from "@preferences/application/dto/preference-response.dto";
import { UserPreference } from "@preferences/domain/models/user-preference.entity";
import {
  PREFERENCE_REPOSITORY,
  type PreferenceRepository,
} from "@preferences/domain/repositories/preference-repository.interface";

@Injectable()
export class PreferenceService {
  constructor(
    @Inject(PREFERENCE_REPOSITORY)
    private readonly preferenceRepository: PreferenceRepository,
  ) {}

  async getByUserId(userId: string): Promise<PreferenceResponseDto> {
    const preference = await this.preferenceRepository.findByUserId(userId);
    if (!preference) return PreferenceResponseDto.defaults(userId);
    return PreferenceResponseDto.from(preference)!;
  }

  async createDefault(userId: string): Promise<void> {
    const preference = UserPreference.restore({
      userId,
      defaultCurrency: "BRL",
      darkMode: true,
    })!;
    await this.preferenceRepository.save(preference);
  }

  async updateCurrency(
    userId: string,
    currency: string,
  ): Promise<PreferenceResponseDto> {
    const existing = await this.preferenceRepository.findByUserId(userId);
    const preference =
      existing ??
      UserPreference.restore({
        userId,
        defaultCurrency: "BRL",
        darkMode: true,
      })!;

    try {
      preference.withDefaultCurrency(currency);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }

    await this.preferenceRepository.save(preference);
    return PreferenceResponseDto.from(preference)!;
  }
}
