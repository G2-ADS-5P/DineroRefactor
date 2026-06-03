import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/models/budget.dart';
import 'package:dinero/models/category.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:flutter/material.dart';

class MockCategoryRepository implements ICategoryRepository {
  @override
  Future<List<Category>> getAll() async => MockData.categories;

  @override
  Future<Budget?> getBudget(String categoryId) async {
    final category = MockData.categories.firstWhere(
      (c) => c.id == categoryId,
      orElse: () => const Category(id: '', name: '', emoji: '', color: Color(0xFF000000), isDefault: false),
    );
    if (category.id.isEmpty || category.budgetAmount == null) return null;
    return Budget(categoryId: categoryId, amount: category.budgetAmount!);
  }

  @override
  Future<double> getSpentByCategory(String categoryId) async => 0;
}
