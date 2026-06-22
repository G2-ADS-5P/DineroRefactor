import 'package:dinero/models/card_model.dart';
import 'package:dinero/repositories/interfaces/i_card_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CardsState {
  final List<CardModel> cards;
  final bool isLoading;

  const CardsState({this.cards = const [], this.isLoading = true});

  CardsState copyWith({List<CardModel>? cards, bool? isLoading}) => CardsState(
        cards: cards ?? this.cards,
        isLoading: isLoading ?? this.isLoading,
      );
}

class CardsViewModel extends StateNotifier<CardsState> {
  CardsViewModel(this._repo) : super(const CardsState()) {
    _load();
  }

  final ICardRepository _repo;

  Future<void> _load() async {
    final cards = await _repo.getAll();
    state = state.copyWith(cards: cards, isLoading: false);
  }

  Future<void> addCard({
    required String name,
    required String brand,
    required String lastDigits,
    required double creditLimit,
    required int dueDay,
  }) async {
    final card = await _repo.create(
      name: name,
      brand: brand,
      lastDigits: lastDigits,
      creditLimit: creditLimit,
      dueDay: dueDay,
    );
    state = state.copyWith(cards: [...state.cards, card]);
  }
}
