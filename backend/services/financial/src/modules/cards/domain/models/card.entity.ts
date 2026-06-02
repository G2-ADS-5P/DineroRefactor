export class Card {
  private readonly _id?: string;
  private _userId: string;
  private _name: string;
  private _brand: string;
  private _lastDigits: string;
  private _currentBill: number;
  private _creditLimit: number;
  private _dueDay: number;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get brand(): string {
    return this._brand;
  }

  get lastDigits(): string {
    return this._lastDigits;
  }

  get currentBill(): number {
    return this._currentBill;
  }

  get creditLimit(): number {
    return this._creditLimit;
  }

  get dueDay(): number {
    return this._dueDay;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  withName(name: string) {
    this._name = name;
    return this;
  }

  withBrand(brand: string) {
    this._brand = brand;
    return this;
  }

  withCreditLimit(value: number) {
    this._creditLimit = value;
    return this;
  }

  withCurrentBill(value: number) {
    this._currentBill = value;
    return this;
  }

  withDueDay(day: number) {
    this._dueDay = day;
    return this;
  }

  static restore(props?: {
    id?: string;
    userId: string;
    name: string;
    brand: string;
    lastDigits: string;
    currentBill?: number;
    creditLimit: number;
    dueDay: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Card | null {
    if (!props) return null;

    const card = new Card(props.id, props.createdAt, props.updatedAt);
    card._userId = props.userId;
    card._name = props.name;
    card._brand = props.brand;
    card._lastDigits = props.lastDigits;
    card._currentBill = props.currentBill ?? 0;
    card._creditLimit = props.creditLimit;
    card._dueDay = props.dueDay;

    return card;
  }
}
