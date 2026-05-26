import { ApiProperty } from "@nestjs/swagger";
import type { UserPreference } from "@preferences/domain/models/user-preference.entity";

export class PreferenceResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ["BRL", "USD", "EUR"] })
  defaultCurrency: "BRL" | "USD" | "EUR";

  @ApiProperty()
  darkMode: boolean;

  private constructor(
    userId: string,
    defaultCurrency: "BRL" | "USD" | "EUR",
    darkMode: boolean,
  ) {
    this.userId = userId;
    this.defaultCurrency = defaultCurrency;
    this.darkMode = darkMode;
  }

  static from(preference: UserPreference | null): PreferenceResponseDto | null {
    if (!preference) return null;
    return new PreferenceResponseDto(
      preference.userId,
      preference.defaultCurrency,
      preference.darkMode,
    );
  }

  static defaults(userId: string): PreferenceResponseDto {
    return new PreferenceResponseDto(userId, "BRL", true);
  }
}
