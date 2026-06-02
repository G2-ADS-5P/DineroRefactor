import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const PLUGGY_BASE_URL = "https://api.pluggy.ai";

export type PluggyConnector = {
  id: number;
  name: string;
  primaryColor: string;
  institutionUrl: string;
  country: string;
  type: "PERSONAL_BANK" | "BUSINESS_BANK" | "INVESTMENT" | string;
  credentials: unknown[];
  hasMFA: boolean;
  imageUrl: string | null;
  isSandbox: boolean;
};

type PluggyAccount = {
  id: string;
  itemId: string;
  type: "BANK" | "CREDIT";
  subtype: "CHECKING_ACCOUNT" | "SAVINGS_ACCOUNT" | "CREDIT_CARD" | string;
  number: string;
  name: string;
  balance: number;
  currencyCode: string;
  creditData?: {
    creditLimit: number;
    availableCreditLimit: number;
    balanceCloseDate: string;
    balanceDueDate: string;
    brand: string;
  };
};

type PluggyTransaction = {
  id: string;
  accountId: string;
  description: string;
  currencyCode: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  date: string;
  category?: string;
};

type PluggyListResponse<T> = {
  total: number;
  totalPages: number;
  results: T[];
};

@Injectable()
export class PluggyApiService {
  private readonly logger = new Logger(PluggyApiService.name);
  private apiKey: string | null = null;
  private apiKeyExpiresAt: number = 0;

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return (
      !!this.configService.get<string>("PLUGGY_CLIENT_ID") &&
      !!this.configService.get<string>("PLUGGY_CLIENT_SECRET")
    );
  }

  async getConnectors(sandboxOnly = false): Promise<PluggyConnector[]> {
    const apiKey = await this.getApiKey();
    const query = sandboxOnly ? "?sandbox=true" : "";
    const response = await this.get<{ results: PluggyConnector[] }>(
      `/connectors${query}`,
      apiKey,
    );
    return response.results;
  }

  async getConnectToken(opts?: {
    itemId?: string;
    clientUserId?: string;
  }): Promise<string> {
    const apiKey = await this.getApiKey();
    const body: Record<string, string> = {};

    if (opts?.itemId) body.itemId = opts.itemId;
    // clientUserId lets us map the webhook event back to our connectionId
    if (opts?.clientUserId) body.clientUserId = opts.clientUserId;

    const response = await this.post<{ accessToken: string }>(
      "/connect_token",
      body,
      apiKey,
    );

    return response.accessToken;
  }

  async getAccounts(itemId: string): Promise<PluggyAccount[]> {
    const apiKey = await this.getApiKey();
    const response = await this.get<PluggyListResponse<PluggyAccount>>(
      `/accounts?itemId=${itemId}`,
      apiKey,
    );
    return response.results;
  }

  async getTransactions(accountId: string): Promise<PluggyTransaction[]> {
    const apiKey = await this.getApiKey();
    const allTransactions: PluggyTransaction[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const response = await this.get<PluggyListResponse<PluggyTransaction>>(
        `/transactions?accountId=${accountId}&pageSize=100&page=${page}`,
        apiKey,
      );
      allTransactions.push(...response.results);
      totalPages = response.totalPages;
      page++;

      // Safety cap: max 5 pages (500 transactions) for academic project
      if (page > 5) break;
    }

    return allTransactions;
  }

  private async getApiKey(): Promise<string> {
    const now = Date.now();

    // Re-authenticate if expired or missing (with 60s buffer)
    if (!this.apiKey || now >= this.apiKeyExpiresAt - 60_000) {
      await this.authenticate();
    }

    return this.apiKey!;
  }

  private async authenticate(): Promise<void> {
    const clientId = this.configService.get<string>("PLUGGY_CLIENT_ID")!;
    const clientSecret = this.configService.get<string>("PLUGGY_CLIENT_SECRET")!;

    const response = await this.post<{ apiKey: string }>(
      "/auth",
      { clientId, clientSecret },
    );

    this.apiKey = response.apiKey;

    // JWT exp is 2 hours — decode to get exact expiry
    try {
      const payload = JSON.parse(
        Buffer.from(response.apiKey.split(".")[1], "base64url").toString(),
      ) as { exp: number };
      this.apiKeyExpiresAt = payload.exp * 1000;
    } catch {
      // Fallback: assume 2 hours from now
      this.apiKeyExpiresAt = Date.now() + 7_200_000;
    }

    this.logger.log("Pluggy API authenticated successfully");
  }

  private async get<T>(path: string, apiKey: string): Promise<T> {
    const res = await fetch(`${PLUGGY_BASE_URL}${path}`, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Pluggy GET ${path} failed [${res.status}]: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  private async post<T>(path: string, body: object, apiKey?: string): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["X-API-KEY"] = apiKey;
    }

    const res = await fetch(`${PLUGGY_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const responseBody = await res.text();
      throw new Error(`Pluggy POST ${path} failed [${res.status}]: ${responseBody}`);
    }

    return res.json() as Promise<T>;
  }
}
