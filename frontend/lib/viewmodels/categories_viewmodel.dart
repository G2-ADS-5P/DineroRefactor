import 'package:dinero/models/category.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';
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

  Future<void> _load() async {
    final categories = await _categoryRepo.getAll();
    final transactions = await _transactionRepo.getAll();
    final now = DateTime(2026, 3, 24);

    final Map<String, double> spentMap = {};
    for (final t in transactions) {
      if (t.type == TransactionType.expense &&
          t.date.year == now.year &&
          t.date.month == now.month) {
        spentMap[t.categoryId] = (spentMap[t.categoryId] ?? 0) + t.valueInBrl;
      }
    }

    final stats = categories.map((c) {
      return CategoryStat(
        category: c,
        spent: spentMap[c.id] ?? 0,
        budget: c.budgetAmount,
      );
    }).toList();

    final totalSpent = spentMap.values.fold(0.0, (a, b) => a + b);

    state = state.copyWith(stats: stats, totalSpent: totalSpent, isLoading: false);
  }

  void addCategory(Category category) {
    final stat = CategoryStat(
      category: category,
      spent: 0,
      budget: category.budgetAmount,
    );
    state = state.copyWith(stats: [...state.stats, stat]);
  }
}
