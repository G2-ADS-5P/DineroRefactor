import 'package:dinero/core/patterns/facade/finance_facade.dart';
import 'package:dinero/core/network/api_client.dart';
import 'package:dinero/models/card_model.dart';
import 'package:dinero/models/category.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/repositories/interfaces/i_card_repository.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AddTransactionStatus { idle, loading, success, error }

class AddTransactionState {
  final TransactionType type;
  final String displayValue;
  final String selectedCategoryId;
  final List<Category> categories;
  final String description;
  final String currency;
  final AddTransactionStatus status;
  final String? errorMessage;
  final List<CardModel> cards;
  final String? selectedCardId;

  const AddTransactionState({
    this.type = TransactionType.expense,
    this.displayValue = '0',
    this.selectedCategoryId = '',
    this.categories = const [],
    this.description = '',
    this.currency = 'BRL',
    this.status = AddTransactionStatus.idle,
    this.errorMessage,
    this.cards = const [],
    this.selectedCardId,
  });

  double get parsedValue =>
      double.tryParse(displayValue.replaceAll(',', '.')) ?? 0;

  AddTransactionState copyWith({
    TransactionType? type,
    String? displayValue,
    String? selectedCategoryId,
    List<Category>? categories,
    String? description,
    String? currency,
    AddTransactionStatus? status,
    String? errorMessage,
    List<CardModel>? cards,
    Object? selectedCardId = _sentinel,
  }) =>
      AddTransactionState(
        type: type ?? this.type,
        displayValue: displayValue ?? this.displayValue,
        selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
        categories: categories ?? this.categories,
        description: description ?? this.description,
        currency: currency ?? this.currency,
        status: status ?? this.status,
        errorMessage: errorMessage,
        cards: cards ?? this.cards,
        selectedCardId: selectedCardId == _sentinel
            ? this.selectedCardId
            : selectedCardId as String?,
      );
}

const _sentinel = Object();

class AddTransactionViewModel extends StateNotifier<AddTransactionState> {
  AddTransactionViewModel(this._facade, this._categoryRepo, this._cardRepo)
      : super(const AddTransactionState()) {
    _load();
  }

  final FinanceFacade _facade;
  final ICategoryRepository _categoryRepo;
  final ICardRepository _cardRepo;

  Future<void> _load() async {
    final cats = await _categoryRepo.getAll();
    final cards = await _cardRepo.getAll();
    state = state.copyWith(
      categories: cats,
      cards: cards,
      selectedCardId: cards.isNotEmpty ? cards.first.id : null,
    );
  }

  void setType(TransactionType type) => state = state.copyWith(type: type);

  void selectCategory(String id) {
    final next = id == state.selectedCategoryId ? '' : id;
    state = state.copyWith(selectedCategoryId: next);
  }

  void selectCard(String id) => state = state.copyWith(selectedCardId: id);

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
    if (state.description.trim().isEmpty) {
      state = state.copyWith(
        status: AddTransactionStatus.error,
        errorMessage: 'Adicione uma descrição para a transação.',
      );
      return;
    }
    state = state.copyWith(status: AddTransactionStatus.loading, errorMessage: null);
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
    } on ApiException catch (e) {
      state = state.copyWith(status: AddTransactionStatus.error, errorMessage: e.message);
    } catch (_) {
      state = state.copyWith(status: AddTransactionStatus.error, errorMessage: 'Erro ao registrar transação.');
    }
  }

  void reset() => state = const AddTransactionState();
}
