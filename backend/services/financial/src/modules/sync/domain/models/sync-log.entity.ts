export class SyncLog {
  private readonly _id?: string;
  private _userId: string;
  private _direction: string;
  private _status: string;
  private _itemsCount: number;
  private _startedAt: Date;
  private _finishedAt?: Date;
  private _errorMessage?: string;
  private readonly _createdAt?: Date;

  private constructor(id?: string, createdAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get direction(): string {
    return this._direction;
  }

  get status(): string {
    return this._status;
  }

  get itemsCount(): number {
    return this._itemsCount;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get finishedAt(): Date | undefined {
    return this._finishedAt;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  withStatus(status: string) {
    this._status = status;
    return this;
  }

  withItemsCount(count: number) {
    this._itemsCount = count;
    return this;
  }

  withFinishedAt(date: Date) {
    this._finishedAt = date;
    return this;
  }

  withErrorMessage(msg: string) {
    this._errorMessage = msg;
    return this;
  }

  static restore(props?: {
    id?: string;
    userId: string;
    direction: string;
    status: string;
    itemsCount?: number;
    startedAt: Date;
    finishedAt?: Date | null;
    errorMessage?: string | null;
    createdAt?: Date;
  }): SyncLog | null {
    if (!props) return null;
    const log = new SyncLog(props.id, props.createdAt);
    log._userId = props.userId;
    log._direction = props.direction;
    log._status = props.status;
    log._itemsCount = props.itemsCount ?? 0;
    log._startedAt = props.startedAt;
    log._finishedAt = props.finishedAt ?? undefined;
    log._errorMessage = props.errorMessage ?? undefined;
    return log;
  }
}
