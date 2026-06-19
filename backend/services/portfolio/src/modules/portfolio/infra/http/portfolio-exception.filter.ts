import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { PortfolioDomainError } from "@portfolio/domain/errors/portfolio.errors";
import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";

const domainStatusByCode: Record<string, HttpStatus> = {
  TICKER_REQUIRED: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_QUANTITY: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_AVERAGE_PRICE: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_UNIT_PRICE: HttpStatus.UNPROCESSABLE_ENTITY,
  INVALID_COSTS: HttpStatus.UNPROCESSABLE_ENTITY,
  INSUFFICIENT_ASSET_QUANTITY: HttpStatus.CONFLICT,
  ASSET_NOT_IN_PORTFOLIO: HttpStatus.CONFLICT,
  ASSET_NOT_FOUND: HttpStatus.NOT_FOUND,
  PORTFOLIO_POSITION_NOT_FOUND: HttpStatus.NOT_FOUND,
  TICKER_ALREADY_REGISTERED: HttpStatus.CONFLICT,
  AUTHENTICATED_USER_REQUIRED: HttpStatus.UNAUTHORIZED,
  PORTFOLIO_ACCESS_NOT_SYNCED: HttpStatus.SERVICE_UNAVAILABLE,
  TRIAL_EXPIRED: HttpStatus.FORBIDDEN,
  SUBSCRIPTION_CANCELED: HttpStatus.FORBIDDEN,
  PLAN_EXPIRED: HttpStatus.FORBIDDEN,
  PORTFOLIO_WRITE_PLAN_REQUIRED: HttpStatus.FORBIDDEN,
};

const defaultCodeByStatus: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: "VALIDATION_ERROR",
  [HttpStatus.UNAUTHORIZED]: "AUTHENTICATION_REQUIRED",
  [HttpStatus.FORBIDDEN]: "ACCESS_DENIED",
  [HttpStatus.NOT_FOUND]: "RESOURCE_NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
  [HttpStatus.UNPROCESSABLE_ENTITY]: "UNPROCESSABLE_ENTITY",
  [HttpStatus.SERVICE_UNAVAILABLE]: "SERVICE_UNAVAILABLE",
};

const translatedMessages: Record<string, string> = {
  "Missing token": "Token de autenticação não informado.",
  "Invalid or expired token": "Token de autenticação inválido ou expirado.",
  "Insufficient permissions": "Você não possui permissão para esta operação.",
};

type ErrorPayload = {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
  correlationId: string;
};

@Catch()
export class PortfolioExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PortfolioExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const correlationId = this.correlationId(request);
    const payload = this.toPayload(exception, request, correlationId);

    response.setHeader("x-correlation-id", correlationId);
    response.status(payload.statusCode).json(payload);
  }

  private toPayload(
    exception: unknown,
    request: Request,
    correlationId: string,
  ): ErrorPayload {
    const base = {
      timestamp: new Date().toISOString(),
      path: request.originalUrl || request.url,
      correlationId,
    };

    if (exception instanceof PortfolioDomainError) {
      return {
        statusCode:
          domainStatusByCode[exception.code] ?? HttpStatus.BAD_REQUEST,
        code: exception.code,
        message: exception.message,
        ...(exception.details ? { details: exception.details } : {}),
        ...base,
      };
    }

    if (exception instanceof HttpException) {
      const originalStatusCode = exception.getStatus();
      const rawResponse = exception.getResponse();
      const rawMessage =
        typeof rawResponse === "string"
          ? rawResponse
          : (rawResponse as Record<string, unknown>).message;
      const validationErrors = Array.isArray(rawMessage)
        ? rawMessage.map(String)
        : undefined;
      const statusCode = validationErrors
        ? HttpStatus.UNPROCESSABLE_ENTITY
        : originalStatusCode;
      const sourceMessage = validationErrors
        ? "Dados inválidos."
        : String(rawMessage ?? exception.message);

      return {
        statusCode,
        code: defaultCodeByStatus[statusCode] ?? "HTTP_ERROR",
        message: translatedMessages[sourceMessage] ?? sourceMessage,
        ...(validationErrors ? { details: { validationErrors } } : {}),
        ...base,
      };
    }

    this.logger.error(
      `Unhandled portfolio error correlationId=${correlationId}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocorreu um erro interno ao processar a solicitação.",
      ...base,
    };
  }

  private correlationId(request: Request): string {
    const header = request.headers["x-correlation-id"];
    if (Array.isArray(header)) return header[0] || randomUUID();
    return header || randomUUID();
  }
}
