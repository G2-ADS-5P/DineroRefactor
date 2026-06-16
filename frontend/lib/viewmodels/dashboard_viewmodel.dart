import 'package:dinero/core/patterns/facade/finance_facade.dart';
import 'package:dinero/models/card_model.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/repositories/interfaces/i_card_repository.dart';
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
  final ICardRepository _cardRepo;

  DashboardViewModel(this._facade, this._cardRepo)
      : super(const DashboardState()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final results = await Future.wait([
        _facade.getTotalBalance(),
        _facade.getMonthlyStats(),
        _facade.getRecentTransactions(limit: 5),
        _cardRepo.getAll(),
      ]);
      final balance = results[0] as double;
      final stats = results[1] as Map<String, double>;
      final recent = results[2] as List<Transaction>;
      final cards = results[3] as List<CardModel>;
      state = state.copyWith(
        totalBalance: balance,
        monthlyIncome: stats['income']!,
        monthlyExpenses: stats['expenses']!,
        recentTransactions: recent,
        cards: cards,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  void toggleBalanceVisibility() {
    state = state.copyWith(balanceHidden: !state.balanceHidden);
  }

  Future<void> refresh() => _load();
}
