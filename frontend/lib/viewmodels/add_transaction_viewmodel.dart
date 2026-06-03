import 'package:dinero/core/patterns/facade/finance_facade.dart';
import 'package:dinero/models/transaction.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AddTransactionStatus { idle, loading, success, error }

class AddTransactionState {
  final TransactionType type;
  final String displayValue;
  final String selectedCategoryId;
  final String description;
  final String currency;
  final AddTransactionStatus status;

  const AddTransactionState({
    this.type = TransactionType.expense,
    this.displayValue = '0',
    this.selectedCategoryId = 'alimentacao',
    this.description = '',
    this.currency = 'BRL',
    this.status = AddTransactionStatus.idle,
  });

  double get parsedValue =>
      double.tryParse(displayValue.replaceAll(',', '.')) ?? 0;

  AddTransactionState copyWith({
    TransactionType? type,
    String? displayValue,
    String? selectedCategoryId,
    String? description,
    String? currency,
    AddTransactionStatus? status,
  }) =>
      AddTransactionState(
        type: type ?? this.type,
        displayValue: displayValue ?? this.displayValue,
        selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
        description: description ?? this.description,
        currency: currency ?? this.currency,
        status: status ?? this.status,
      );
}

class AddTransactionViewModel extends StateNotifier<AddTransactionState> {
  final FinanceFacade _facade;

  AddTransactionViewModel(this._facade) : super(const AddTransactionState());

  void setType(TransactionType type) => state = state.copyWith(type: type);

  void selectCategory(String id) =>
      state = state.copyWith(selectedCategoryId: id);

  void setDescription(String value) =>
      state = state.copyWith(description: value);

  void setCurrency(String currency) =>
      state = state.copyWith(currency: currency);

  void appendDigit(String digit) {
    final current = state.displayValue;
    if (current == '0') {
      state = state.copyWith(displayValue: digit);
    } else if (current.length < 10) {
      state = state.copyWith(displayValue: current + digit);
    }
  }

  void appendDecimal() {
    if (!state.displayValue.contains(',')) {
      state = state.copyWith(displayValue: '${state.displayValue},');
    }
  }

  void backspace() {
    final current = state.displayValue;
    if (current.length <= 1) {
      state = state.copyWith(displayValue: '0');
    } else {
      state = state.copyWith(displayValue: current.substring(0, current.length - 1));
    }
  }

  Future<void> submit() async {
    if (state.parsedValue <= 0) return;
    state = state.copyWith(status: AddTransactionStatus.loading);
    try {
      if (state.type == TransactionType.expense) {
        await _facade.registerExpense(
          value: state.parsedValue,
          currency: state.currency,
          categoryId: state.selectedCategoryId,
          description: state.description,
        );
      } else {
        await _facade.registerIncome(
          value: state.parsedValue,
          currency: state.currency,
          categoryId: state.selectedCategoryId,
          description: state.description,
        );
      }
      state = state.copyWith(status: AddTransactionStatus.success);
    } catch (_) {
      state = state.copyWith(status: AddTransactionStatus.error);
    }
  }

  void reset() => state = const AddTransactionState();
}
