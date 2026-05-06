export class User {
  private readonly _id?: string;
  private _email: string;
  private _password: string;
  private _teacherRefId?: string;
  private _teacherId?: string;
  private _teacherName?: string;
  private _permissions: string[];
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

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get teacherRefId(): string | undefined {
    return this._teacherRefId;
  }

  get teacherId(): string | undefined {
    return this._teacherId;
  }

  get teacherName(): string | undefined {
    return this._teacherName;
  }

  get permissions(): string[] {
    return this._permissions;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  withEmail(email: string) {
    this._email = email;
    return this;
  }

  withPassword(password: string) {
    this._password = password;
    return this;
  }

  withTeacherRefId(teacherRefId: string | undefined) {
    this._teacherRefId = teacherRefId;
    return this;
  }

  withTeacherId(teacherId: string | undefined) {
    this._teacherId = teacherId;
    return this;
  }

  withTeacherName(teacherName: string | undefined) {
    this._teacherName = teacherName;
    return this;
  }

  withPermissions(permissions: string[]) {
    this._permissions = permissions;
    return this;
  }

  static restore(props?: {
    id?: string;
    email: string;
    password: string;
    teacherRefId?: string | null;
    teacherId?: string | null;
    teacherName?: string | null;
    permissions: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }): User | null {
    if (!props) return null;

    const user = new User(props.id, props.createdAt, props.updatedAt);
    user._email = props.email;
    user._password = props.password;
    user._teacherRefId = props.teacherRefId ?? undefined;
    user._teacherId = props.teacherId ?? undefined;
    user._teacherName = props.teacherName ?? undefined;
    user._permissions = props.permissions ?? [];

    return user;
  }
}
