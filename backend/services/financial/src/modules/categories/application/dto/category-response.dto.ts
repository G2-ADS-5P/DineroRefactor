import type { Category } from "@categories/domain/models/category.entity";
import { ApiProperty } from "@nestjs/swagger";

export class CategoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() name: string;
  @ApiProperty() type: string;
  @ApiProperty() color: string;
  @ApiProperty() icon: string;
  @ApiProperty({ nullable: true }) parentId: string | undefined;
  @ApiProperty() createdAt: Date | undefined;
  @ApiProperty() updatedAt: Date | undefined;

  private constructor(
    id: string,
    userId: string,
    name: string,
    type: string,
    color: string,
    icon: string,
    parentId: string | undefined,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.type = type;
    this.color = color;
    this.icon = icon;
    this.parentId = parentId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(category: Category | null): CategoryResponseDto | null {
    if (!category) return null;

    return new CategoryResponseDto(
      category.id!,
      category.userId,
      category.name,
      category.type,
      category.color,
      category.icon,
      category.parentId,
      category.createdAt,
      category.updatedAt,
    );
  }
}
