export class Category {
  private readonly _id?: string;
  private _userId: string;
  private _name: string;
  private _type: string;
  private _color: string;
  private _icon: string;
  private _parentId?: string;
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

  get name(): string {
    return this._name;
  }

  get type(): string {
    return this._type;
  }

  get color(): string {
    return this._color;
  }

  get icon(): string {
    return this._icon;
  }

  get parentId(): string | undefined {
    return this._parentId;
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

  withType(type: string) {
    this._type = type;
    return this;
  }

  withColor(color: string) {
    this._color = color;
    return this;
  }

  withIcon(icon: string) {
    this._icon = icon;
    return this;
  }

  withParentId(parentId: string | undefined) {
    this._parentId = parentId;
    return this;
  }

  static restore(props?: {
    id?: string;
    userId: string;
    name: string;
    type: string;
    color: string;
    icon: string;
    parentId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Category | null {
    if (!props) return null;

    const category = new Category(props.id, props.createdAt, props.updatedAt);
    category._userId = props.userId;
    category._name = props.name;
    category._type = props.type;
    category._color = props.color;
    category._icon = props.icon;
    category._parentId = props.parentId ?? undefined;

    return category;
  }
}
