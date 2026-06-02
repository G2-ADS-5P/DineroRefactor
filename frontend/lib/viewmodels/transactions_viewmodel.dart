import 'package:dinero/core/patterns/facade/finance_facade.dart';
import 'package:dinero/models/transaction.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class TransactionsState {
  final List<Transaction> transactions;
  final bool isLoading;
  final String selectedFilter;
  final String searchQuery;

  const TransactionsState({
    this.transactions = const [],
    this.isLoading = true,
    this.selectedFilter = 'todas',
    this.searchQuery = '',
  });

  List<Transaction> get filtered {
    var list = transactions;
    if (selectedFilter != 'todas') {
      list = list.where((t) => t.categoryId == selectedFilter).toList();
    }
    if (searchQuery.isNotEmpty) {
      final q = searchQuery.toLowerCase();
      list = list.where((t) => t.description.toLowerCase().contains(q)).toList();
    }
    return list;
  }

  TransactionsState copyWith({
    List<Transaction>? transactions,
    bool? isLoading,
    String? selectedFilter,
    String? searchQuery,
  }) =>
      TransactionsState(
        transactions: transactions ?? this.transactions,
        isLoading: isLoading ?? this.isLoading,
        selectedFilter: selectedFilter ?? this.selectedFilter,
        searchQuery: searchQuery ?? this.searchQuery,
      );
}

class TransactionsViewModel extends StateNotifier<TransactionsState> {
  final FinanceFacade _facade;

  TransactionsViewModel(this._facade) : super(const TransactionsState()) {
    _load();
  }

  Future<void> _load() async {
    final all = await _facade.getAllTransactions();
    state = state.copyWith(transactions: all, isLoading: false);
  }

  void setFilter(String filter) {
    state = state.copyWith(selectedFilter: filter);
  }

  void setSearch(String query) {
    state = state.copyWith(searchQuery: query);
  }

  Future<void> refresh() => _load();
}
