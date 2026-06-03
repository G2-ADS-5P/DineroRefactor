import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/models/card_model.dart';
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
  CardsViewModel() : super(const CardsState()) {
    state = CardsState(cards: MockData.cards, isLoading: false);
  }
}
