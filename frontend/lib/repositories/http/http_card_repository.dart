import 'package:dinero/core/config/app_config.dart';
import 'package:dinero/core/network/api_client.dart';
import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/models/card_model.dart';
import 'package:dinero/repositories/interfaces/i_card_repository.dart';
import 'package:flutter/material.dart';

class HttpCardRepository implements ICardRepository {
  HttpCardRepository(this._client);

  final ApiClient _client;

  @override
  Future<List<CardModel>> getAll() async {
    final raw = await _client.get(BackendService.financial, '/cards');
    final result = ApiClient.unwrapList(raw);
    final localCards = result.items.map(_mapCard).toList();

    try {
      final openFinanceCards = await _getOpenFinanceCards();
      return [...localCards, ...openFinanceCards];
    } catch (_) {
      return localCards;
    }
  }

  @override
  Future<CardModel> create({
    required String name,
    required String brand,
    required String lastDigits,
    required double creditLimit,
    required int dueDay,
  }) async {
    final raw = await _client.post(
      BackendService.financial,
      '/cards',
      body: {
        'name': name,
        'brand': brand,
        'lastDigits': lastDigits,
        'creditLimit': creditLimit,
        'dueDay': dueDay,
      },
    );
    return _mapCard(ApiClient.unwrapItem(raw));
  }

  // ---------------------------------------------------------------------------

  CardModel _mapCard(Map<String, dynamic> j) {
    final brand = (j['brand'] as String? ?? '').toUpperCase();
    return CardModel(
      id: j['id'] as String,
      name: j['name'] as String? ?? '',
      currentBill: _toDouble(j['currentBill'] ?? 0),
      dueDays: (j['dueDay'] as num?)?.toInt() ?? 0,
      lastFour: j['lastDigits'] as String? ?? '',
      network: brand,
      creditLimit:
          j['creditLimit'] != null ? _toDouble(j['creditLimit']) : null,
      color: _colorForBrand(brand),
      isDebit: false,
      isOpenFinance: false,
    );
  }

  Future<List<CardModel>> _getOpenFinanceCards() async {
    final rawConnections = await _client.get(
      BackendService.openfinance,
      '/bank-connections',
    );
    final connections = ApiClient.unwrapList(rawConnections).items;

    final cardGroups = await Future.wait(
      connections.map((connection) async {
        final connectionId = connection['id'] as String?;
        if (connectionId == null) return <CardModel>[];

        try {
          final rawCards = await _client.get(
            BackendService.openfinance,
            '/bank-connections/$connectionId/cards',
          );
          final bankName = connection['bankName'] as String? ?? 'Open Finance';
          return ApiClient.unwrapList(rawCards)
              .items
              .map((card) => _mapOpenFinanceCard(card, bankName))
              .toList();
        } catch (_) {
          return <CardModel>[];
        }
      }),
    );

    return cardGroups.expand((cards) => cards).toList();
  }

  CardModel _mapOpenFinanceCard(
    Map<String, dynamic> card,
    String bankName,
  ) {
    final brand = (card['cardBrand'] as String? ?? '').toUpperCase();
    final id = card['id']?.toString() ??
        '${card['bankConnectionId']}:${card['lastFourDigits']}';

    return CardModel(
      id: 'openfinance:$id',
      name: '$bankName ${card['cardBrand'] ?? ''}'.trim(),
      currentBill: _toDouble(card['currentBill']),
      dueDays: int.tryParse(card['dueDay']?.toString() ?? '') ?? 0,
      color: _colorForBrand(brand),
      lastFour: card['lastFourDigits']?.toString() ?? '',
      network: brand,
      creditLimit: _toDouble(card['cardLimit']),
      isDebit: false,
      isOpenFinance: true,
    );
  }

  static Color _colorForBrand(String brand) {
    switch (brand) {
      case 'MASTERCARD':
        return AppColors.nubank;
      case 'VISA':
        return AppColors.inter;
      case 'ELO':
        return AppColors.bancoBrasil;
      default:
        return AppColors.dark.surfaceAlt;
    }
  }

  static double _toDouble(dynamic v) {
    if (v is num) return v.toDouble();
    if (v is String) return double.parse(v);
    return 0;
  }
}
