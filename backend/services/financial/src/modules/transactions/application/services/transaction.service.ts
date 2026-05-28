import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import type { CreateTransactionDto } from "@transactions/application/dto/create-transaction.dto";
import { TransactionResponseDto } from "@transactions/application/dto/transaction-response.dto";
import type { UpdateTransactionDto } from "@transactions/application/dto/update-transaction.dto";
import { TransactionMessagingService } from "@transactions/application/services/transaction-messaging.service";
import { Transaction } from "@transactions/domain/models/transaction.entity";
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepository,
} from "@transactions/domain/repositories/transaction-repository.interface";
import { UserService } from "@users/application/services/user.service";

@Injectable()
export class TransactionService {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    private readonly userService: UserService,
    private readonly transactionMessagingService: TransactionMessagingService,
  ) {}

  async create(
    externalUserId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    if (dto.currency !== "BRL" && (!dto.amountBrl || !dto.exchangeRate)) {
      throw new BadRequestException(
        "amountBrl and exchangeRate are required when currency is not BRL",
      );
    }

    const localUser = await this.userService.ensureLocalUser(externalUserId);

    if (dto.clientUuid) {
      const existing =
        await this.transactionRepository.findByClientUuidAndUserId(
          dto.clientUuid,
          localUser.id!,
        );
      if (existing) return TransactionResponseDto.from(existing)!;
    }

    const transaction = Transaction.restore({
      userId: localUser.id!,
      cardId: dto.cardId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      currency: dto.currency,
      amountBrl: dto.amountBrl,
      exchangeRate: dto.exchangeRate,
      type: dto.type,
      description: dto.description,
      date: new Date(dto.date),
      isRecurring: dto.isRecurring ?? false,
      recurringRule: dto.recurringRule,
      notes: dto.notes,
      tags: dto.tags,
      clientUuid: dto.clientUuid,
    })!;

    await this.transactionRepository.create(transaction);

    const { rows } = await this.transactionRepository.findAllByUserIdPaginated(
      localUser.id!,
      { page: 1, limit: 1 },
    );

    const dto2 = TransactionResponseDto.from(rows[0])!;
    await this.transactionMessagingService.publishTransactionCreated(dto2);

    return dto2;
  }

  async findById(
    externalUserId: string,
    id: string,
  ): Promise<TransactionResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const transaction = await this.transactionRepository.findByIdAndUserId(
      id,
      localUser.id!,
    );
    if (!transaction) throw new NotFoundException("Transaction not found");

    return TransactionResponseDto.from(transaction)!;
  }

  async listPaginated(
    externalUserId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<TransactionResponseDto>> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const { rows, total } =
      await this.transactionRepository.findAllByUserIdPaginated(
        localUser.id!,
        params,
      );

    return {
      data: rows.map((t) => TransactionResponseDto.from(t)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async update(
    externalUserId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const transaction = await this.transactionRepository.findByIdAndUserId(
      id,
      localUser.id!,
    );
    if (!transaction) throw new NotFoundException("Transaction not found");

    if (dto.amount !== undefined) transaction.withAmount(dto.amount);
    if (dto.currency !== undefined) transaction.withAmount(transaction.amount);
    if (dto.amountBrl !== undefined) transaction.withAmountBrl(dto.amountBrl);
    if (dto.exchangeRate !== undefined)
      transaction.withExchangeRate(dto.exchangeRate);
    if (dto.type !== undefined) transaction.withType(dto.type);
    if (dto.description !== undefined)
      transaction.withDescription(dto.description);
    if (dto.date !== undefined) transaction.withDate(new Date(dto.date));
    if (dto.cardId !== undefined) transaction.withCardId(dto.cardId);
    if (dto.categoryId !== undefined)
      transaction.withCategoryId(dto.categoryId);
    if (dto.isRecurring !== undefined)
      transaction.withIsRecurring(dto.isRecurring);
    if (dto.recurringRule !== undefined)
      transaction.withRecurringRule(dto.recurringRule);
    if (dto.notes !== undefined) transaction.withNotes(dto.notes);
    if (dto.tags !== undefined) transaction.withTags(dto.tags);

    await this.transactionRepository.update(transaction);

    const result = TransactionResponseDto.from(transaction)!;
    await this.transactionMessagingService.publishTransactionUpdated(result);

    return result;
  }

  async remove(externalUserId: string, id: string): Promise<void> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const transaction = await this.transactionRepository.findByIdAndUserId(
      id,
      localUser.id!,
    );
    if (!transaction) throw new NotFoundException("Transaction not found");

    transaction.withDeletedAt(new Date());
    await this.transactionRepository.softDelete(transaction);

    await this.transactionMessagingService.publishTransactionDeleted({
      id: transaction.id!,
      userId: transaction.userId,
      deletedAt: transaction.deletedAt!,
    });
  }

  async aggregateBalanceForUser(
    localUserId: string,
    params: { startDate: Date; endDate: Date },
  ) {
    return this.transactionRepository.aggregateBalance(
      localUserId,
      params.startDate,
      params.endDate,
    );
  }

  async findAllByUserIdSince(
    localUserId: string,
    since: Date,
  ): Promise<TransactionResponseDto[]> {
    const rows = await this.transactionRepository.findAllByUserIdSince(
      localUserId,
      since,
    );
    return rows.map((t) => TransactionResponseDto.from(t)!);
  }

  async findAllByUserId(
    localUserId: string,
  ): Promise<TransactionResponseDto[]> {
    const rows = await this.transactionRepository.findAllByUserId(localUserId);
    return rows.map((t) => TransactionResponseDto.from(t)!);
  }

  async findAllForSync(
    localUserId: string,
    since?: Date,
  ): Promise<TransactionResponseDto[]> {
    const rows = await this.transactionRepository.findAllByUserIdForSync(
      localUserId,
      since,
    );
    return rows.map((t) => TransactionResponseDto.from(t)!);
  }
}
