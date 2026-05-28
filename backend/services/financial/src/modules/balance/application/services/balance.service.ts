import type { BalanceSummaryDto } from "@balance/application/dto/balance-summary.dto";
import { Injectable } from "@nestjs/common";
import { TransactionService } from "@transactions/application/services/transaction.service";
import { UserService } from "@users/application/services/user.service";

@Injectable()
export class BalanceService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {}

  async getSummary(
    externalUserId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BalanceSummaryDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);

    const { totalIncome, totalExpense, byCategory } =
      await this.transactionService.aggregateBalanceForUser(localUser.id!, {
        startDate,
        endDate,
      });

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      period: { startDate, endDate },
      byCategory,
      byType: { income: totalIncome, expense: totalExpense },
    };
  }
}
