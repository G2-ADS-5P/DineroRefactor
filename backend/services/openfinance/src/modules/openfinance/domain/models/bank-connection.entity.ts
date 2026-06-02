export enum BankConnectionStatus {
  PENDING_CONSENT = "pending_consent",
  ACTIVE = "active",
  REVOKED = "revoked",
}

export class BankConnection {
  private readonly _id?: string;
  private _userId: string;
  private _bankName: string;
  private _consentId: string;
  private _pluggyItemId?: string | null;
  private _status: BankConnectionStatus;
  private _connectedAt: Date;
  private _revokedAt?: Date | null;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get userId(): string { return this._userId; }
  get bankName(): string { return this._bankName; }
  get consentId(): string { return this._consentId; }
  get pluggyItemId(): string | null | undefined { return this._pluggyItemId; }
  get status(): BankConnectionStatus { return this._status; }
  get connectedAt(): Date { return this._connectedAt; }
  get revokedAt(): Date | null | undefined { return this._revokedAt; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withStatus(status: BankConnectionStatus): void { this._status = status; }
  withRevokedAt(date: Date): void { this._revokedAt = date; }

  static restore(props: {
    id?: string;
    userId: string;
    bankName: string;
    consentId: string;
    pluggyItemId?: string | null;
    status: BankConnectionStatus;
    connectedAt: Date;
    revokedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): BankConnection {
    const instance = new BankConnection(props.id, props.createdAt, props.updatedAt);
    instance._userId = props.userId;
    instance._bankName = props.bankName;
    instance._consentId = props.consentId;
    instance._pluggyItemId = props.pluggyItemId;
    instance._status = props.status;
    instance._connectedAt = props.connectedAt;
    instance._revokedAt = props.revokedAt;
    return instance;
  }
}
