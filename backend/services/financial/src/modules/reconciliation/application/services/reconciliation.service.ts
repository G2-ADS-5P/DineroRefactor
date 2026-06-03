import { Injectable } from "@nestjs/common";
import type {
  DuplicateGroupDto,
  DuplicatesResponseDto,
} from "@reconciliation/application/dto/duplicate-group.dto";
import type { ResolveDuplicatesDto } from "@reconciliation/application/dto/resolve-duplicates.dto";
import type { TransactionResponseDto } from "@transactions/application/dto/transaction-response.dto";
import { TransactionService } from "@transactions/application/services/transaction.service";
import { UserService } from "@users/application/services/user.service";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const AMOUNT_TOLERANCE = 0.01;

@Injectable()
export class ReconciliationService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {}

  async findDuplicates(externalUserId: string): Promise<DuplicatesResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const transactions = await this.transactionService.findAllByUserId(
      localUser.id!,
    );

    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

    const visited = new Set<string>();
    const groups: DuplicateGroupDto[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const a = transactions[i];
      if (visited.has(a.id)) continue;

      const group: TransactionResponseDto[] = [a];

      for (let j = i + 1; j < transactions.length; j++) {
        const b = transactions[j];
        if (visited.has(b.id)) continue;
        if (this.areDuplicates(a, b)) {
          group.push(b);
          visited.add(b.id);
        }
      }

      if (group.length > 1) {
        visited.add(a.id);
        groups.push({ groupId: `group-${i}`, transactions: group });
      }
    }

    return { totalGroups: groups.length, groups };
  }

  async resolve(
    externalUserId: string,
    dto: ResolveDuplicatesDto,
  ): Promise<void> {
    for (const id of dto.deleteIds) {
      await this.transactionService.remove(externalUserId, id);
    }
  }

  private areDuplicates(
    a: TransactionResponseDto,
    b: TransactionResponseDto,
  ): boolean {
    const timeDiff = Math.abs(a.date.getTime() - b.date.getTime());
    if (timeDiff >= FIVE_MINUTES_MS) return false;
    if (a.currency !== b.currency) return false;
    if (Math.abs(a.amount - b.amount) >= AMOUNT_TOLERANCE) return false;

    const descA = a.description.toLowerCase();
    const descB = b.description.toLowerCase();
    return (
      descA === descB || descA.startsWith(descB) || descB.startsWith(descA)
    );
  }
}
