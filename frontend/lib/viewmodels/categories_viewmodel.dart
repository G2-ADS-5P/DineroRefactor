import 'package:dinero/models/category.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CategoryStat {
  final Category category;
  final double spent;
  final double? budget;

  const CategoryStat({
    required this.category,
    required this.spent,
    this.budget,
  });

  double get percent => budget != null && budget! > 0 ? spent / budget! : 0;
}

class CategoriesState {
  final List<CategoryStat> stats;
  final double totalSpent;
  final bool isLoading;

  const CategoriesState({
    this.stats = const [],
    this.totalSpent = 0,
    this.isLoading = true,
  });

  CategoriesState copyWith({
    List<CategoryStat>? stats,
    double? totalSpent,
    bool? isLoading,
  }) =>
      CategoriesState(
        stats: stats ?? this.stats,
        totalSpent: totalSpent ?? this.totalSpent,
        isLoading: isLoading ?? this.isLoading,
      );
}

class CategoriesViewModel extends StateNotifier<CategoriesState> {
  final ICategoryRepository _categoryRepo;
  final ITransactionRepository _transactionRepo;

  CategoriesViewModel(this._categoryRepo, this._transactionRepo)
      : super(const CategoriesState()) {
    _load();
  }

  static const _defaultCategories = [
    {'name': 'Moradia', 'emoji': '🏠', 'color': 0xFF3B82F6, 'budget': 2500.0},
    {
      'name': 'Alimentação',
      'emoji': '🍔',
      'color': 0xFFF97316,
      'budget': 1000.0
    },
    {'name': 'Transporte', 'emoji': '🚗', 'color': 0xFF22C55E, 'budget': 500.0},
    {'name': 'Lazer', 'emoji': '🎮', 'color': 0xFFA855F7, 'budget': 400.0},
    {
      'name': 'Assinaturas',
      'emoji': '📱',
      'color': 0xFF06B6D4,
      'budget': 350.0
    },
    {'name': 'Saúde', 'emoji': '❤️', 'color': 0xFFEC4899, 'budget': 300.0},
    {'name': 'Educação', 'emoji': '📚', 'color': 0xFFF59E0B, 'budget': 200.0},
    {'name': 'Outros', 'emoji': '💼', 'color': 0xFF64748B, 'budget': null},
  ];

  Future<void> _load() async {
    state = state.copyWith(isLoading: true);
    var categories = await _categoryRepo.getAll();

    if (categories.isEmpty) {
      await _seedDefaults();
      categories = await _categoryRepo.getAll();
    }

    final spentMap = await _transactionRepo.getMonthlySpentByCategories();

    final stats = categories.map((c) {
      return CategoryStat(
        category: c,
        spent: spentMap[c.id] ?? 0,
        budget: c.budgetAmount,
      );
    }).toList();

    final totalSpent = spentMap.values.fold(0.0, (a, b) => a + b);
    state =
        state.copyWith(stats: stats, totalSpent: totalSpent, isLoading: false);
  }

  Future<void> _seedDefaults() async {
    for (final d in _defaultCategories) {
      try {
        await _categoryRepo.create(Category(
          id: '',
          name: d['name'] as String,
          emoji: d['emoji'] as String,
          color: Color(d['color'] as int),
          isDefault: true,
          budgetAmount: d['budget'] as double?,
        ));
      } catch (_) {}
    }
  }

  Future<void> refresh() => _load();

  Future<void> createCategory(Category category) async {
    try {
      await _categoryRepo.create(category);
      await _load();
    } catch (_) {}
  }

  Future<void> deleteCategory(String id) async {
    try {
      await _categoryRepo.delete(id);
      await _load();
    } catch (_) {}
  }
}
