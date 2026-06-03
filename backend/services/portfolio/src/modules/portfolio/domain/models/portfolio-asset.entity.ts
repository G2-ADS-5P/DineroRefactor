export class PortfolioAsset {
  private readonly _id?: string;
  private _userId: string;
  private _assetId: string;
  private _quantity: number;
  private _averagePrice: number;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

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

  get assetId(): string {
    return this._assetId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get averagePrice(): number {
    return this._averagePrice;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  get totalCost(): number {
    return this._quantity * this._averagePrice;
  }

  get isEmpty(): boolean {
    return this._quantity <= 0;
  }

  addPosition(quantity: number, price: number): void {
    if (quantity <= 0) throw new Error("Quantity must be greater than 0");
    if (price <= 0) throw new Error("Average price must be greater than 0");

    const totalShares = this._quantity + quantity;
    const totalCost = this.totalCost + quantity * price;

    this._quantity = totalShares;
    this._averagePrice = totalCost / totalShares;
    this._updatedAt = new Date();
  }

  removePosition(quantity: number): void {
    if (quantity <= 0) throw new Error("Quantity must be greater than 0");
    if (quantity > this._quantity) throw new Error("Insufficient quantity");

    this._quantity -= quantity;
    this._updatedAt = new Date();
  }

  static create(props: {
    userId: string;
    assetId: string;
    quantity: number;
    averagePrice: number;
  }): PortfolioAsset {
    if (props.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    if (props.averagePrice <= 0) {
      throw new Error("Average price must be greater than 0");
    }

    const now = new Date();
    const portfolioAsset = new PortfolioAsset(undefined, now, now);
    portfolioAsset._userId = props.userId;
    portfolioAsset._assetId = props.assetId;
    portfolioAsset._quantity = props.quantity;
    portfolioAsset._averagePrice = props.averagePrice;

    return portfolioAsset;
  }

  static restore(props?: {
    id?: string;
    userId: string;
    assetId: string;
    quantity: number;
    averagePrice: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): PortfolioAsset | null {
    if (!props) return null;

    const portfolioAsset = new PortfolioAsset(
      props.id,
      props.createdAt,
      props.updatedAt,
    );
    portfolioAsset._userId = props.userId;
    portfolioAsset._assetId = props.assetId;
    portfolioAsset._quantity = props.quantity;
    portfolioAsset._averagePrice = props.averagePrice;

    return portfolioAsset;
  }
}
