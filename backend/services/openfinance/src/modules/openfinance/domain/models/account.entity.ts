export enum AccountType {
  CHECKING = "checking",
  SAVINGS = "savings",
}

export class Account {
  private readonly _id?: string;
  private _bankConnectionId: string;
  private _externalId: string;
  private _accountType: AccountType;
  private _accountNumber: string;
  private _balance: number;
  private _currency: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get bankConnectionId(): string { return this._bankConnectionId; }
  get externalId(): string { return this._externalId; }
  get accountType(): AccountType { return this._accountType; }
  get accountNumber(): string { return this._accountNumber; }
  get balance(): number { return this._balance; }
  get currency(): string { return this._currency; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  static restore(props: {
    id?: string;
    bankConnectionId: string;
    externalId: string;
    accountType: AccountType;
    accountNumber: string;
    balance: number;
    currency: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Account {
    const instance = new Account(props.id, props.createdAt, props.updatedAt);
    instance._bankConnectionId = props.bankConnectionId;
    instance._externalId = props.externalId;
    instance._accountType = props.accountType;
    instance._accountNumber = props.accountNumber;
    instance._balance = props.balance;
    instance._currency = props.currency;
    return instance;
  }
}
