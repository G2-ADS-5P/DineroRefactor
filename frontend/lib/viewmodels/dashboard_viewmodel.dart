import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/core/patterns/facade/finance_facade.dart';
import 'package:dinero/models/card_model.dart';
import 'package:dinero/models/transaction.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DashboardState {
  final double totalBalance;
  final double monthlyIncome;
  final double monthlyExpenses;
  final List<Transaction> recentTransactions;
  final List<CardModel> cards;
  final bool isLoading;
  final bool balanceHidden;

  const DashboardState({
    this.totalBalance = 0,
    this.monthlyIncome = 0,
    this.monthlyExpenses = 0,
    this.recentTransactions = const [],
    this.cards = const [],
    this.isLoading = true,
    this.balanceHidden = false,
  });

  DashboardState copyWith({
    double? totalBalance,
    double? monthlyIncome,
    double? monthlyExpenses,
    List<Transaction>? recentTransactions,
    List<CardModel>? cards,
    bool? isLoading,
    bool? balanceHidden,
  }) =>
      DashboardState(
        totalBalance: totalBalance ?? this.totalBalance,
        monthlyIncome: monthlyIncome ?? this.monthlyIncome,
        monthlyExpenses: monthlyExpenses ?? this.monthlyExpenses,
        recentTransactions: recentTransactions ?? this.recentTransactions,
        cards: cards ?? this.cards,
        isLoading: isLoading ?? this.isLoading,
        balanceHidden: balanceHidden ?? this.balanceHidden,
      );
}

class DashboardViewModel extends StateNotifier<DashboardState> {
  final FinanceFacade _facade;

  DashboardViewModel(this._facade) : super(const DashboardState()) {
    _load();
  }

  Future<void> _load() async {
    final balance = await _facade.getTotalBalance();
    final stats = await _facade.getMonthlyStats();
    final recent = await _facade.getRecentTransactions(limit: 5);
    state = state.copyWith(
      totalBalance: balance,
      monthlyIncome: stats['income']!,
      monthlyExpenses: stats['expenses']!,
      recentTransactions: recent,
      cards: MockData.cards,
      isLoading: false,
    );
  }

  void toggleBalanceVisibility() {
    state = state.copyWith(balanceHidden: !state.balanceHidden);
  }

  Future<void> refresh() => _load();
}
