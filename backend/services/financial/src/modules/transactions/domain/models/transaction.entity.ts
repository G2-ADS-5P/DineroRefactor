export class Transaction {
  private readonly _id?: string;
  private _userId: string;
  private _cardId?: string;
  private _categoryId?: string;
  private _amount: number;
  private _currency: string;
  private _amountBrl?: number;
  private _exchangeRate?: number;
  private _type: string;
  private _description: string;
  private _date: Date;
  private _isRecurring: boolean;
  private _recurringRule?: string;
  private _notes?: string;
  private _tags?: string[];
  private _clientUuid?: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;
  private _deletedAt?: Date;

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

  get cardId(): string | undefined {
    return this._cardId;
  }

  get categoryId(): string | undefined {
    return this._categoryId;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  get amountBrl(): number | undefined {
    return this._amountBrl;
  }

  get exchangeRate(): number | undefined {
    return this._exchangeRate;
  }

  get type(): string {
    return this._type;
  }

  get description(): string {
    return this._description;
  }

  get date(): Date {
    return this._date;
  }

  get isRecurring(): boolean {
    return this._isRecurring;
  }

  get recurringRule(): string | undefined {
    return this._recurringRule;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get tags(): string[] | undefined {
    return this._tags;
  }

  get clientUuid(): string | undefined {
    return this._clientUuid;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  withDescription(description: string) {
    this._description = description;
    return this;
  }

  withAmount(amount: number) {
    this._amount = amount;
    return this;
  }

  withAmountBrl(amountBrl: number | undefined) {
    this._amountBrl = amountBrl;
    return this;
  }

  withExchangeRate(rate: number | undefined) {
    this._exchangeRate = rate;
    return this;
  }

  withType(type: string) {
    this._type = type;
    return this;
  }

  withDate(date: Date) {
    this._date = date;
    return this;
  }

  withCardId(cardId: string | undefined) {
    this._cardId = cardId;
    return this;
  }

  withCategoryId(categoryId: string | undefined) {
    this._categoryId = categoryId;
    return this;
  }

  withNotes(notes: string | undefined) {
    this._notes = notes;
    return this;
  }

  withTags(tags: string[] | undefined) {
    this._tags = tags;
    return this;
  }

  withIsRecurring(isRecurring: boolean) {
    this._isRecurring = isRecurring;
    return this;
  }

  withRecurringRule(rule: string | undefined) {
    this._recurringRule = rule;
    return this;
  }

  withDeletedAt(deletedAt: Date) {
    this._deletedAt = deletedAt;
    return this;
  }

  static restore(props?: {
    id?: string;
    userId: string;
    cardId?: string | null;
    categoryId?: string | null;
    amount: number;
    currency: string;
    amountBrl?: number | null;
    exchangeRate?: number | null;
    type: string;
    description: string;
    date: Date;
    isRecurring?: boolean;
    recurringRule?: string | null;
    notes?: string | null;
    tags?: string[] | null;
    clientUuid?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }): Transaction | null {
    if (!props) return null;

    const tx = new Transaction(props.id, props.createdAt, props.updatedAt);
    tx._userId = props.userId;
    tx._cardId = props.cardId ?? undefined;
    tx._categoryId = props.categoryId ?? undefined;
    tx._amount = props.amount;
    tx._currency = props.currency;
    tx._amountBrl = props.amountBrl ?? undefined;
    tx._exchangeRate = props.exchangeRate ?? undefined;
    tx._type = props.type;
    tx._description = props.description;
    tx._date = props.date;
    tx._isRecurring = props.isRecurring ?? false;
    tx._recurringRule = props.recurringRule ?? undefined;
    tx._notes = props.notes ?? undefined;
    tx._tags = props.tags ?? undefined;
    tx._clientUuid = props.clientUuid ?? undefined;
    tx._deletedAt = props.deletedAt ?? undefined;

    return tx;
  }
}
