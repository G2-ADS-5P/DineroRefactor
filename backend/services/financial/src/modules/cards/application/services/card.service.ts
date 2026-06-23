import { CardResponseDto } from "@cards/application/dto/card-response.dto";
import type { CreateCardDto } from "@cards/application/dto/create-card.dto";
import type { UpdateCardDto } from "@cards/application/dto/update-card.dto";
import { Card } from "@cards/domain/models/card.entity";
import {
  CARD_REPOSITORY,
  type CardRepository,
} from "@cards/domain/repositories/card-repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import { UserService } from "@users/application/services/user.service";

@Injectable()
export class CardService {
  constructor(
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: CardRepository,
    private readonly userService: UserService,
  ) {}

  async create(
    externalUserId: string,
    dto: CreateCardDto,
  ): Promise<CardResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);

    const card = Card.restore({
      userId: localUser.id!,
      name: dto.name,
      brand: dto.brand,
      lastDigits: dto.lastDigits,
      currentBill: 0,
      creditLimit: dto.creditLimit,
      dueDay: dto.dueDay,
    })!;

    await this.cardRepository.create(card);

    const { rows } = await this.cardRepository.findAllByUserIdPaginated(
      localUser.id!,
      { page: 1, limit: 1 },
    );
    return CardResponseDto.from(rows[0])!;
  }

  async findById(externalUserId: string, id: string): Promise<CardResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const card = await this.cardRepository.findByIdAndUserId(id, localUser.id!);
    if (!card) throw new NotFoundException("Card not found");

    return CardResponseDto.from(card)!;
  }

  async listPaginated(
    externalUserId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<CardResponseDto>> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const { rows, total } = await this.cardRepository.findAllByUserIdPaginated(
      localUser.id!,
      params,
    );

    return {
      data: rows.map((c) => CardResponseDto.from(c)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async update(
    externalUserId: string,
    id: string,
    dto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const card = await this.cardRepository.findByIdAndUserId(id, localUser.id!);
    if (!card) throw new NotFoundException("Card not found");

    if (dto.name !== undefined) card.withName(dto.name);
    if (dto.brand !== undefined) card.withBrand(dto.brand);
    if (dto.creditLimit !== undefined) card.withCreditLimit(dto.creditLimit);
    if (dto.currentBill !== undefined) card.withCurrentBill(dto.currentBill);
    if (dto.dueDay !== undefined) card.withDueDay(dto.dueDay);

    await this.cardRepository.update(card);

    return CardResponseDto.from(card)!;
  }

  async remove(externalUserId: string, id: string): Promise<void> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const card = await this.cardRepository.findByIdAndUserId(id, localUser.id!);
    if (!card) throw new NotFoundException("Card not found");

    await this.cardRepository.delete(id);
  }

  async addToCurrentBill(
    externalUserId: string,
    id: string,
    amount: number,
  ): Promise<void> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const card = await this.cardRepository.findByIdAndUserId(id, localUser.id!);
    if (!card) throw new NotFoundException("Card not found");

    card.withCurrentBill(card.currentBill + amount);
    await this.cardRepository.update(card);
  }
}
