export enum BankTransactionType {
  DEBIT = "debit",
  CREDIT = "credit",
}

export class BankStatementTransaction {
  private readonly _id?: string;
  private _accountId: string;
  private _description: string;
  private _amount: number;
  private _type: BankTransactionType;
  private _category?: string | null;
  private _transactionDate: Date;
  private readonly _createdAt?: Date;

  private constructor(id?: string, createdAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
  }

  get id(): string | undefined { return this._id; }
  get accountId(): string { return this._accountId; }
  get description(): string { return this._description; }
  get amount(): number { return this._amount; }
  get type(): BankTransactionType { return this._type; }
  get category(): string | null | undefined { return this._category; }
  get transactionDate(): Date { return this._transactionDate; }
  get createdAt(): Date | undefined { return this._createdAt; }

  static restore(props: {
    id?: string;
    accountId: string;
    description: string;
    amount: number;
    type: BankTransactionType;
    category?: string | null;
    transactionDate: Date;
    createdAt?: Date;
  }): BankStatementTransaction {
    const instance = new BankStatementTransaction(props.id, props.createdAt);
    instance._accountId = props.accountId;
    instance._description = props.description;
    instance._amount = props.amount;
    instance._type = props.type;
    instance._category = props.category;
    instance._transactionDate = props.transactionDate;
    return instance;
  }
}
