export type SubscriptionPlan = "TRIAL" | "FREE" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELED";

export class Subscription {
  private readonly _id?: string;
  private _userId: string;
  private _plan: SubscriptionPlan;
  private _status: SubscriptionStatus;
  private _trialEndsAt?: Date;
  private _planExpiresAt?: Date;
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

  get plan(): SubscriptionPlan {
    return this._plan;
  }

  get status(): SubscriptionStatus {
    return this._status;
  }

  get trialEndsAt(): Date | undefined {
    return this._trialEndsAt;
  }

  get planExpiresAt(): Date | undefined {
    return this._planExpiresAt;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  withUserId(userId: string) {
    this._userId = userId;
    return this;
  }

  withPlan(plan: SubscriptionPlan) {
    this._plan = plan;
    return this;
  }

  withStatus(status: SubscriptionStatus) {
    this._status = status;
    return this;
  }

  withTrialEndsAt(trialEndsAt: Date | undefined) {
    this._trialEndsAt = trialEndsAt;
    return this;
  }

  withPlanExpiresAt(planExpiresAt: Date | undefined) {
    this._planExpiresAt = planExpiresAt;
    return this;
  }

  isTrialExpired(now: Date): boolean {
    if (this._plan !== "TRIAL") return false;
    if (!this._trialEndsAt) return true;
    return now > this._trialEndsAt;
  }

  hasAccess(now: Date): boolean {
    if (this._status !== "ACTIVE") return false;
    if (this._plan === "PRO") return true;
    if (this._plan === "TRIAL") return !this.isTrialExpired(now);
    return false;
  }

  markExpired(): void {
    this._status = "EXPIRED";
  }

  static restore(props?: {
    id?: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    trialEndsAt?: Date | null;
    planExpiresAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Subscription | null {
    if (!props) return null;

    const subscription = new Subscription(
      props.id,
      props.createdAt,
      props.updatedAt,
    );
    subscription._userId = props.userId;
    subscription._plan = props.plan;
    subscription._status = props.status;
    subscription._trialEndsAt = props.trialEndsAt ?? undefined;
    subscription._planExpiresAt = props.planExpiresAt ?? undefined;

    return subscription;
  }
}
