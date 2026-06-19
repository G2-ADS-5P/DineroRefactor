export type PortfolioErrorDetails = Record<string, unknown>;

export class PortfolioDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: PortfolioErrorDetails,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class TickerRequiredError extends PortfolioDomainError {
  constructor() {
    super("TICKER_REQUIRED", "O ticker do ativo é obrigatório.");
  }
}

export class InvalidQuantityError extends PortfolioDomainError {
  constructor(quantity: number) {
    super("INVALID_QUANTITY", "A quantidade deve ser maior que zero.", {
      quantity,
    });
  }
}

export class InvalidAveragePriceError extends PortfolioDomainError {
  constructor(price: number) {
    super("INVALID_AVERAGE_PRICE", "O preço médio deve ser maior que zero.", {
      price,
    });
  }
}

export class InvalidUnitPriceError extends PortfolioDomainError {
  constructor(price: number) {
    super("INVALID_UNIT_PRICE", "O preço unitário deve ser maior que zero.", {
      price,
    });
  }
}

export class InvalidCostsError extends PortfolioDomainError {
  constructor(costs: number) {
    super("INVALID_COSTS", "Os custos da operação não podem ser negativos.", {
      costs,
    });
  }
}

export class InsufficientQuantityError extends PortfolioDomainError {
  constructor(available: number, requested: number) {
    super(
      "INSUFFICIENT_ASSET_QUANTITY",
      `Você possui ${available} cota(s), mas tentou vender ${requested}.`,
      { available, requested },
    );
  }
}

export class AssetNotInPortfolioError extends PortfolioDomainError {
  constructor(ticker: string) {
    super(
      "ASSET_NOT_IN_PORTFOLIO",
      `O ativo ${ticker} não está na sua carteira.`,
      { ticker },
    );
  }
}

export class AssetNotFoundError extends PortfolioDomainError {
  constructor(identifier: string) {
    super("ASSET_NOT_FOUND", "Ativo não encontrado.", { identifier });
  }
}

export class PortfolioPositionNotFoundError extends PortfolioDomainError {
  constructor(positionId: string) {
    super(
      "PORTFOLIO_POSITION_NOT_FOUND",
      "Posição da carteira não encontrada.",
      { positionId },
    );
  }
}

export class TickerAlreadyRegisteredError extends PortfolioDomainError {
  constructor(ticker: string) {
    super(
      "TICKER_ALREADY_REGISTERED",
      `O ticker ${ticker.toUpperCase()} já está cadastrado.`,
      { ticker: ticker.toUpperCase() },
    );
  }
}

export class AuthenticatedUserRequiredError extends PortfolioDomainError {
  constructor() {
    super(
      "AUTHENTICATED_USER_REQUIRED",
      "É necessário estar autenticado para acessar este recurso.",
    );
  }
}

export class PortfolioAccessNotSyncedError extends PortfolioDomainError {
  constructor() {
    super(
      "PORTFOLIO_ACCESS_NOT_SYNCED",
      "O acesso ao portfólio ainda não foi sincronizado. Tente novamente em instantes.",
    );
  }
}

export class TrialExpiredError extends PortfolioDomainError {
  constructor(trialEndsAt?: Date) {
    super("TRIAL_EXPIRED", "Seu período de teste expirou.", {
      trialEndsAt: trialEndsAt?.toISOString() ?? null,
    });
  }
}

export class SubscriptionCanceledError extends PortfolioDomainError {
  constructor() {
    super("SUBSCRIPTION_CANCELED", "Sua assinatura foi cancelada.");
  }
}

export class PlanExpiredError extends PortfolioDomainError {
  constructor(planExpiresAt?: Date) {
    super("PLAN_EXPIRED", "Seu plano PRO expirou.", {
      planExpiresAt: planExpiresAt?.toISOString() ?? null,
    });
  }
}

export class PortfolioPlanDoesNotAllowWriteError extends PortfolioDomainError {
  constructor(plan: string) {
    super(
      "PORTFOLIO_WRITE_PLAN_REQUIRED",
      "Seu plano atual não permite realizar operações no portfólio.",
      { plan },
    );
  }
}
