export const PortfolioTransactionTypes = ["COMPRA", "VENDA"] as const;

export type PortfolioTransactionType =
  (typeof PortfolioTransactionTypes)[number];

export class PortfolioTransaction {
  private readonly _id?: string;
  private _userId: string;
  private _assetId: string;
  private _type: PortfolioTransactionType;
  private _operationDate: Date;
  private _quantity: number;
  private _unitPrice: number;
  private _costs: number;
  private _totalValue: number;
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

  get assetId(): string {
    return this._assetId;
  }

  get type(): PortfolioTransactionType {
    return this._type;
  }

  get operationDate(): Date {
    return this._operationDate;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get costs(): number {
    return this._costs;
  }

  get totalValue(): number {
    return this._totalValue;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  static create(props: {
    userId: string;
    assetId: string;
    type: PortfolioTransactionType;
    operationDate: Date;
    quantity: number;
    unitPrice: number;
    costs: number;
  }): PortfolioTransaction {
    if (props.quantity <= 0) throw new Error("Quantity must be greater than 0");
    if (props.unitPrice <= 0)
      throw new Error("Unit price must be greater than 0");
    if (props.costs < 0) throw new Error("Costs cannot be negative");

    const transaction = new PortfolioTransaction(undefined, new Date());
    transaction._userId = props.userId;
    transaction._assetId = props.assetId;
    transaction._type = props.type;
    transaction._operationDate = props.operationDate;
    transaction._quantity = props.quantity;
    transaction._unitPrice = props.unitPrice;
    transaction._costs = props.costs;
    transaction._totalValue =
      props.type === "COMPRA"
        ? props.quantity * props.unitPrice + props.costs
        : props.quantity * props.unitPrice - props.costs;

    return transaction;
  }

  static restore(props?: {
    id?: string;
    userId: string;
    assetId: string;
    type: PortfolioTransactionType | string;
    operationDate: Date;
    quantity: number;
    unitPrice: number;
    costs: number;
    totalValue: number;
    createdAt?: Date;
  }): PortfolioTransaction | null {
    if (!props) return null;

    const transaction = new PortfolioTransaction(props.id, props.createdAt);
    transaction._userId = props.userId;
    transaction._assetId = props.assetId;
    transaction._type = props.type as PortfolioTransactionType;
    transaction._operationDate = props.operationDate;
    transaction._quantity = props.quantity;
    transaction._unitPrice = props.unitPrice;
    transaction._costs = props.costs;
    transaction._totalValue = props.totalValue;

    return transaction;
  }
}
