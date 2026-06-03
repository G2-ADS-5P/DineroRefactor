export class User {
  private readonly _id?: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _phone?: string;
  private _birthDate?: Date;
  private _location?: string;
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

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get phone(): string | undefined {
    return this._phone;
  }

  get birthDate(): Date | undefined {
    return this._birthDate;
  }

  get location(): string | undefined {
    return this._location;
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

  withPassword(password: string) {
    this._password = password;
    return this;
  }

  withPhone(phone: string | undefined) {
    this._phone = phone;
    return this;
  }

  withBirthDate(birthDate: Date | undefined) {
    this._birthDate = birthDate;
    return this;
  }

  withLocation(location: string | undefined) {
    this._location = location;
    return this;
  }

  static restore(props?: {
    id?: string;
    name: string;
    email: string;
    password: string;
    phone?: string | null;
    birthDate?: Date | null;
    location?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): User | null {
    if (!props) return null;

    const user = new User(props.id, props.createdAt, props.updatedAt);
    user._name = props.name;
    user._email = props.email;
    user._password = props.password;
    user._phone = props.phone ?? undefined;
    user._birthDate = props.birthDate ?? undefined;
    user._location = props.location ?? undefined;

    return user;
  }
}
