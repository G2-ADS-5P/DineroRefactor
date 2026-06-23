import 'dart:math';
import 'package:dinero/models/card_model.dart';
import 'package:dinero/repositories/interfaces/i_card_repository.dart';
import 'package:flutter/material.dart';
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

  static const _previewCardsByBank = <String, List<Map<String, dynamic>>>{
    'Nubank': [
      {
        'name': 'Nubank Roxinho',
        'lastFour': '4921',
        'network': 'MASTERCARD',
        'color': 0xFF8B5CF6,
        'limit': 8500.0,
        'bill': 1340.90,
        'due': 7,
        'debit': false
      },
      {
        'name': 'NuConta',
        'lastFour': '3847',
        'network': 'MASTERCARD',
        'color': 0xFF8B5CF6,
        'limit': null,
        'bill': 2847.33,
        'due': 0,
        'debit': true
      },
    ],
    'Itaú': [
      {
        'name': 'Itaú Gold',
        'lastFour': '7732',
        'network': 'VISA',
        'color': 0xFFFF6B00,
        'limit': 12000.0,
        'bill': 3210.55,
        'due': 10,
        'debit': false
      },
      {
        'name': 'Itaú Conta',
        'lastFour': '5519',
        'network': 'VISA',
        'color': 0xFFFF6B00,
        'limit': null,
        'bill': 1523.80,
        'due': 0,
        'debit': true
      },
      {
        'name': 'Itaú Platinum',
        'lastFour': '0083',
        'network': 'MASTERCARD',
        'color': 0xFFCC5500,
        'limit': 25000.0,
        'bill': 780.20,
        'due': 20,
        'debit': false
      },
    ],
    'Bradesco': [
      {
        'name': 'Bradesco Neo',
        'lastFour': '6614',
        'network': 'VISA',
        'color': 0xFFCC0000,
        'limit': 6000.0,
        'bill': 942.10,
        'due': 5,
        'debit': false
      },
      {
        'name': 'Bradesco Conta',
        'lastFour': '2290',
        'network': 'VISA',
        'color': 0xFFCC0000,
        'limit': null,
        'bill': 3401.50,
        'due': 0,
        'debit': true
      },
    ],
    'Banco do Brasil': [
      {
        'name': 'BB Ourocard',
        'lastFour': '8823',
        'network': 'VISA',
        'color': 0xFFFFCC00,
        'limit': 9000.0,
        'bill': 1670.44,
        'due': 12,
        'debit': false
      },
      {
        'name': 'BB Conta',
        'lastFour': '4401',
        'network': 'MASTERCARD',
        'color': 0xFF004A99,
        'limit': null,
        'bill': 5200.00,
        'due': 0,
        'debit': true
      },
      {
        'name': 'BB Estilo',
        'lastFour': '1155',
        'network': 'VISA',
        'color': 0xFF003882,
        'limit': 18000.0,
        'bill': 320.90,
        'due': 18,
        'debit': false
      },
    ],
    'Santander': [
      {
        'name': 'Santander Free',
        'lastFour': '3307',
        'network': 'MASTERCARD',
        'color': 0xFFEC0000,
        'limit': 5500.0,
        'bill': 2108.75,
        'due': 8,
        'debit': false
      },
      {
        'name': 'Santander Conta',
        'lastFour': '9982',
        'network': 'MASTERCARD',
        'color': 0xFFEC0000,
        'limit': null,
        'bill': 890.60,
        'due': 0,
        'debit': true
      },
    ],
    'Inter': [
      {
        'name': 'Inter Mastercard',
        'lastFour': '5567',
        'network': 'MASTERCARD',
        'color': 0xFFFF6B00,
        'limit': 7200.0,
        'bill': 1890.20,
        'due': 3,
        'debit': false
      },
      {
        'name': 'Inter Conta',
        'lastFour': '7743',
        'network': 'MASTERCARD',
        'color': 0xFFFF6B00,
        'limit': null,
        'bill': 4320.00,
        'due': 0,
        'debit': true
      },
    ],
    'C6 Bank': [
      {
        'name': 'C6 Carbon',
        'lastFour': '2281',
        'network': 'MASTERCARD',
        'color': 0xFF1A1A2E,
        'limit': 15000.0,
        'bill': 4230.10,
        'due': 15,
        'debit': false
      },
      {
        'name': 'C6 Conta',
        'lastFour': '8890',
        'network': 'MASTERCARD',
        'color': 0xFF16213E,
        'limit': null,
        'bill': 1200.00,
        'due': 0,
        'debit': true
      },
    ],
    'XP Investimentos': [
      {
        'name': 'XP Visa Infinite',
        'lastFour': '4410',
        'network': 'VISA',
        'color': 0xFF000000,
        'limit': 30000.0,
        'bill': 6740.30,
        'due': 22,
        'debit': false
      },
      {
        'name': 'XP Conta',
        'lastFour': '6623',
        'network': 'VISA',
        'color': 0xFF111111,
        'limit': null,
        'bill': 8900.00,
        'due': 0,
        'debit': true
      },
    ],
  };

  Future<void> _load() async {
    final cards = await _repo.getAll();
    state = state.copyWith(cards: cards, isLoading: false);
  }

  Future<void> reload() => _load();

  /// Retorna lista de cartões de preview para um banco (sem adicionar ainda).
  List<CardModel> previewOpenFinanceCards(String bankName) {
    final templates =
        _previewCardsByBank[bankName] ?? _previewCardsByBank['Inter']!;
    final rng = Random();
    final count = 2 + rng.nextInt(templates.length - 1);
    return templates
        .take(count)
        .map((t) => CardModel(
              id: 'of_${bankName}_${t['lastFour']}',
              name: t['name'] as String,
              lastFour: t['lastFour'] as String,
              network: t['network'] as String,
              color: Color(t['color'] as int),
              currentBill: t['bill'] as double,
              dueDays: t['due'] as int,
              creditLimit: t['limit'] as double?,
              isDebit: t['debit'] as bool,
              isOpenFinance: true,
            ))
        .toList();
  }

  void importCards(List<CardModel> imported) {
    final existing = state.cards.map((c) => c.id).toSet();
    final newCards = imported.where((c) => !existing.contains(c.id)).toList();
    if (newCards.isEmpty) return;
    state = state.copyWith(cards: [...state.cards, ...newCards]);
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
