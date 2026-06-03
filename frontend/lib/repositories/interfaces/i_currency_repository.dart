import 'package:dinero/models/currency.dart';

abstract class ICurrencyRepository {
  Future<Map<String, double>> getRates();
  Future<List<Currency>> getAll();
}
