import 'package:dinero/models/card_model.dart';

abstract class ICardRepository {
  Future<List<CardModel>> getAll();
  Future<CardModel> create({
    required String name,
    required String brand,
    required String lastDigits,
    required double creditLimit,
    required int dueDay,
  });
}
