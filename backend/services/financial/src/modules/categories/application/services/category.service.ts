import { CategoryResponseDto } from "@categories/application/dto/category-response.dto";
import type { CreateCategoryDto } from "@categories/application/dto/create-category.dto";
import type { UpdateCategoryDto } from "@categories/application/dto/update-category.dto";
import { Category } from "@categories/domain/models/category.entity";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@categories/domain/repositories/category-repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import { UserService } from "@users/application/services/user.service";

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly userService: UserService,
  ) {}

  async create(
    externalUserId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);

    const category = Category.restore({
      userId: localUser.id!,
      name: dto.name,
      type: dto.type,
      color: dto.color,
      icon: dto.icon,
      parentId: dto.parentId,
    })!;

    await this.categoryRepository.create(category);

    const { rows } = await this.categoryRepository.findAllByUserIdPaginated(
      localUser.id!,
      { page: 1, limit: 1 },
    );
    return CategoryResponseDto.from(rows[0])!;
  }

  async findById(
    externalUserId: string,
    id: string,
  ): Promise<CategoryResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const category = await this.categoryRepository.findByIdAndUserId(
      id,
      localUser.id!,
    );
    if (!category) throw new NotFoundException("Category not found");

    return CategoryResponseDto.from(category)!;
  }

  async listPaginated(
    externalUserId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<CategoryResponseDto>> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const { rows, total } =
      await this.categoryRepository.findAllByUserIdPaginated(
        localUser.id!,
        params,
      );

    return {
      data: rows.map((c) => CategoryResponseDto.from(c)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async update(
    externalUserId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const category = await this.categoryRepository.findByIdAndUserId(
      id,
      localUser.id!,
    );
    if (!category) throw new NotFoundException("Category not found");

    if (dto.name !== undefined) category.withName(dto.name);
    if (dto.type !== undefined) category.withType(dto.type);
    if (dto.color !== undefined) category.withColor(dto.color);
    if (dto.icon !== undefined) category.withIcon(dto.icon);
    if (dto.parentId !== undefined) category.withParentId(dto.parentId);

    await this.categoryRepository.update(category);

    return CategoryResponseDto.from(category)!;
  }

  async remove(externalUserId: string, id: string): Promise<void> {
    const localUser = await this.userService.ensureLocalUser(externalUserId);
    const category = await this.categoryRepository.findByIdAndUserId(
      id,
      localUser.id!,
    );
    if (!category) throw new NotFoundException("Category not found");

    await this.categoryRepository.delete(id);
  }
}
