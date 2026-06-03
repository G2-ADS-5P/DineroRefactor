export class User {
  private readonly _id?: string;
  private _externalId: string;
  private _name: string;
  private _email: string;
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

  get externalId(): string {
    return this._externalId;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
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

  withEmail(email: string) {
    this._email = email;
    return this;
  }

  static restore(props?: {
    id?: string;
    externalId: string;
    name: string;
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): User | null {
    if (!props) return null;

    const user = new User(props.id, props.createdAt, props.updatedAt);
    user._externalId = props.externalId;
    user._name = props.name;
    user._email = props.email;

    return user;
  }
}
