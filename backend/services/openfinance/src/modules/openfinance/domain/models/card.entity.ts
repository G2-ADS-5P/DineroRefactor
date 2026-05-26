export type CardBrand = "Visa" | "Mastercard" | "Elo" | "Hipercard";

export class Card {
  private readonly _id?: string;
  private _bankConnectionId: string;
  private _lastFourDigits: string;
  private _cardBrand: CardBrand;
  private _cardLimit: number;
  private _availableLimit: number;
  private _currentBill: number;
  private _dueDay: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get bankConnectionId(): string { return this._bankConnectionId; }
  get lastFourDigits(): string { return this._lastFourDigits; }
  get cardBrand(): CardBrand { return this._cardBrand; }
  get cardLimit(): number { return this._cardLimit; }
  get availableLimit(): number { return this._availableLimit; }
  get currentBill(): number { return this._currentBill; }
  get dueDay(): string { return this._dueDay; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  static restore(props: {
    id?: string;
    bankConnectionId: string;
    lastFourDigits: string;
    cardBrand: CardBrand;
    cardLimit: number;
    availableLimit: number;
    currentBill: number;
    dueDay: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Card {
    const instance = new Card(props.id, props.createdAt, props.updatedAt);
    instance._bankConnectionId = props.bankConnectionId;
    instance._lastFourDigits = props.lastFourDigits;
    instance._cardBrand = props.cardBrand;
    instance._cardLimit = props.cardLimit;
    instance._availableLimit = props.availableLimit;
    instance._currentBill = props.currentBill;
    instance._dueDay = props.dueDay;
    return instance;
  }
}
