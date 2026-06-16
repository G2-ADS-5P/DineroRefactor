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
    return result.items.map(_mapCard).toList();
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
      creditLimit: j['creditLimit'] != null ? _toDouble(j['creditLimit']) : null,
      color: _colorForBrand(brand),
      isDebit: false,
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
        return AppColors.surfaceAlt;
    }
  }

  static double _toDouble(dynamic v) {
    if (v is num) return v.toDouble();
    if (v is String) return double.parse(v);
    return 0;
  }
}
