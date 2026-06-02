import 'package:dinero/models/category.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CategoryDetailState {
  final Category? category;
  final List<Transaction> transactions;
  final double totalSpent;
  final double? budget;
  final bool isLoading;

  const CategoryDetailState({
    this.category,
    this.transactions = const [],
    this.totalSpent = 0,
    this.budget,
    this.isLoading = true,
  });

  double get percent => budget != null && budget! > 0 ? totalSpent / budget! : 0;

  CategoryDetailState copyWith({
    Category? category,
    List<Transaction>? transactions,
    double? totalSpent,
    double? budget,
    bool? isLoading,
  }) =>
      CategoryDetailState(
        category: category ?? this.category,
        transactions: transactions ?? this.transactions,
        totalSpent: totalSpent ?? this.totalSpent,
        budget: budget ?? this.budget,
        isLoading: isLoading ?? this.isLoading,
      );
}

class CategoryDetailViewModel extends StateNotifier<CategoryDetailState> {
  final ICategoryRepository _categoryRepo;
  final ITransactionRepository _transactionRepo;

  CategoryDetailViewModel(this._categoryRepo, this._transactionRepo)
      : super(const CategoryDetailState());

  Future<void> load(String categoryId) async {
    final categories = await _categoryRepo.getAll();
    final category = categories.firstWhere((c) => c.id == categoryId);
    final all = await _transactionRepo.getAll();
    final filtered = all
        .where((t) => t.categoryId == categoryId && t.type == TransactionType.expense)
        .toList();
    final totalSpent = filtered.fold(0.0, (sum, t) => sum + t.valueInBrl);
    state = state.copyWith(
      category: category,
      transactions: filtered,
      totalSpent: totalSpent,
      budget: category.budgetAmount,
      isLoading: false,
    );
  }
}
