export const AssetTypes = [
  "ACAO",
  "FII",
  "BDR",
  "ETF",
  "RENDA_FIXA",
  "CRIPTO",
] as const;

export type AssetType = (typeof AssetTypes)[number];

export class Asset {
  private readonly _id?: string;
  private _ticker: string;
  private _name: string;
  private _type: AssetType;
  private readonly _createdAt?: Date;

  private constructor(id?: string, createdAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get ticker(): string {
    return this._ticker;
  }

  get name(): string {
    return this._name;
  }

  get type(): AssetType {
    return this._type;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  static create(props: {
    ticker: string;
    name: string;
    type: AssetType;
  }): Asset {
    if (!props.ticker.trim()) {
      throw new Error("Ticker cannot be empty");
    }

    const asset = new Asset();
    asset._ticker = props.ticker.toUpperCase();
    asset._name = props.name;
    asset._type = props.type;

    return asset;
  }

  static restore(props?: {
    id?: string;
    ticker: string;
    name: string;
    type: AssetType | string;
    createdAt?: Date;
  }): Asset | null {
    if (!props) return null;

    const asset = new Asset(props.id, props.createdAt);
    asset._ticker = props.ticker.toUpperCase();
    asset._name = props.name;
    asset._type = props.type as AssetType;

    return asset;
  }
}
