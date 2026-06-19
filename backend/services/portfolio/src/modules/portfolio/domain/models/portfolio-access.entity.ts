export type PortfolioAccessPlan = "TRIAL" | "PRO";
export type PortfolioAccessStatus = "ACTIVE" | "EXPIRED" | "CANCELED";

export class PortfolioAccess {
  private readonly _id?: string;
  private _userId: string;
  private _plan: PortfolioAccessPlan;
  private _status: PortfolioAccessStatus;
  private _trialEndsAt?: Date;
  private _planExpiresAt?: Date;
  private _lastEventAt: Date;
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

  get plan(): PortfolioAccessPlan {
    return this._plan;
  }

  get status(): PortfolioAccessStatus {
    return this._status;
  }

  get trialEndsAt(): Date | undefined {
    return this._trialEndsAt;
  }

  get planExpiresAt(): Date | undefined {
    return this._planExpiresAt;
  }

  get lastEventAt(): Date {
    return this._lastEventAt;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  canWrite(now = new Date()): boolean {
    if (this._status !== "ACTIVE") return false;

    if (this._plan === "TRIAL") {
      return this._trialEndsAt !== undefined && now <= this._trialEndsAt;
    }

    if (this._plan === "PRO") {
      return this._planExpiresAt === undefined || now <= this._planExpiresAt;
    }

    return false;
  }

  isNewerThan(eventDate: Date): boolean {
    return this._lastEventAt > eventDate;
  }

  static restore(props?: {
    id?: string;
    userId: string;
    plan: PortfolioAccessPlan;
    status: PortfolioAccessStatus;
    trialEndsAt?: Date | null;
    planExpiresAt?: Date | null;
    lastEventAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): PortfolioAccess | null {
    if (!props) return null;

    const access = new PortfolioAccess(
      props.id,
      props.createdAt,
      props.updatedAt,
    );
    access._userId = props.userId;
    access._plan = props.plan;
    access._status = props.status;
    access._trialEndsAt = props.trialEndsAt ?? undefined;
    access._planExpiresAt = props.planExpiresAt ?? undefined;
    access._lastEventAt = props.lastEventAt;

    return access;
  }
}
