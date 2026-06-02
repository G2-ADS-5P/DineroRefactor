import {
  BankConnection,
  BankConnectionStatus,
} from "@openfinance/domain/models/bank-connection.entity";
import type { BankConnectionRepository } from "@openfinance/domain/repositories/bank-connection-repository.interface";
import { bankConnectionsSchema } from "@openfinance/infra/database/schemas/bank-connection.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleBankConnectionRepository
  implements BankConnectionRepository
{
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(bankConnection: BankConnection): Promise<BankConnection> {
    const [row] = await this.drizzleService.db
      .insert(bankConnectionsSchema)
      .values({
        userId: bankConnection.userId,
        bankName: bankConnection.bankName,
        consentId: bankConnection.consentId,
        pluggyItemId: bankConnection.pluggyItemId ?? null,
        status: bankConnection.status,
        connectedAt: bankConnection.connectedAt,
        revokedAt: bankConnection.revokedAt ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return this.toEntity(row);
  }

  async findById(id: string): Promise<BankConnection | null> {
    const result = await this.drizzleService.db
      .select()
      .from(bankConnectionsSchema)
      .where(eq(bankConnectionsSchema.id, id))
      .limit(1);

    if (!result[0]) return null;
    return this.toEntity(result[0]);
  }

  async findAllByUserId(userId: string): Promise<BankConnection[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(bankConnectionsSchema)
      .where(eq(bankConnectionsSchema.userId, userId));

    return rows.map((row) => this.toEntity(row));
  }

  async activate(id: string, pluggyItemId?: string): Promise<void> {
    await this.drizzleService.db
      .update(bankConnectionsSchema)
      .set({
        status: "active",
        pluggyItemId: pluggyItemId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(bankConnectionsSchema.id, id));
  }

  async revoke(id: string): Promise<void> {
    await this.drizzleService.db
      .update(bankConnectionsSchema)
      .set({ status: "revoked", revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(bankConnectionsSchema.id, id));
  }

  private toEntity(
    row: typeof bankConnectionsSchema.$inferSelect,
  ): BankConnection {
    return BankConnection.restore({
      id: row.id,
      userId: row.userId,
      bankName: row.bankName,
      consentId: row.consentId,
      pluggyItemId: row.pluggyItemId,
      status: row.status as BankConnectionStatus,
      connectedAt: row.connectedAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
