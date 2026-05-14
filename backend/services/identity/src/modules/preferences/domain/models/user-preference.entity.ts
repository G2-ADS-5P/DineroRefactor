export const SUPPORTED_CURRENCIES = ["BRL", "USD", "EUR"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export class UserPreference {
  private readonly _id?: string;
  private _userId: string;
  private _defaultCurrency: SupportedCurrency;
  private _darkMode: boolean;

  private constructor(id?: string) {
    this._id = id;
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get defaultCurrency(): SupportedCurrency {
    return this._defaultCurrency;
  }

  get darkMode(): boolean {
    return this._darkMode;
  }

  withDefaultCurrency(currency: string) {
    if (!SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) {
      throw new Error(
        `Unsupported currency: ${currency}. Allowed: ${SUPPORTED_CURRENCIES.join(", ")}`,
      );
    }
    this._defaultCurrency = currency as SupportedCurrency;
    return this;
  }

  withDarkMode(value: boolean) {
    this._darkMode = value;
    return this;
  }

  static restore(props?: {
    id?: string;
    userId: string;
    defaultCurrency: string;
    darkMode: boolean;
  }): UserPreference | null {
    if (!props) return null;

    if (
      !SUPPORTED_CURRENCIES.includes(props.defaultCurrency as SupportedCurrency)
    ) {
      throw new Error(
        `Unsupported currency: ${props.defaultCurrency}. Allowed: ${SUPPORTED_CURRENCIES.join(", ")}`,
      );
    }

    const preference = new UserPreference(props.id);
    preference._userId = props.userId;
    preference._defaultCurrency = props.defaultCurrency as SupportedCurrency;
    preference._darkMode = props.darkMode;

    return preference;
  }
}
