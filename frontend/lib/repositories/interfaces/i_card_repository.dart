import 'package:dinero/models/card_model.dart';

abstract class ICardRepository {
  Future<List<CardModel>> getAll();
}
