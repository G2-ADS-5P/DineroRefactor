import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/models/currency.dart';
import 'package:dinero/repositories/interfaces/i_currency_repository.dart';

class MockCurrencyRepository implements ICurrencyRepository {
  @override
  Future<Map<String, double>> getRates() async => MockData.exchangeRates;

  @override
  Future<List<Currency>> getAll() async => MockData.currencies;
}
