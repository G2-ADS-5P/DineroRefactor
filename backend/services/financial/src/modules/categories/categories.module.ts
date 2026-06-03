import { CategoryService } from "@categories/application/services/category.service";
import { CATEGORY_REPOSITORY } from "@categories/domain/repositories/category-repository.interface";
import { CategoriesController } from "@categories/infra/controllers/categories.controller";
import { DrizzleCategoryRepository } from "@categories/infra/repositories/drizzle-category.repository";
import { Module } from "@nestjs/common";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [CategoriesController],
  providers: [
    CategoryService,
    DrizzleCategoryRepository,
    { provide: CATEGORY_REPOSITORY, useExisting: DrizzleCategoryRepository },
  ],
  exports: [CategoryService],
})
export class CategoriesModule {}
