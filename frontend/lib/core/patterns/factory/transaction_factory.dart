import 'package:dinero/models/transaction.dart';

class TransactionFactory {
  static Transaction fromBackend({
    required String id,
    required double value,
    required String currency,
    required double exchangeRate,
    required double valueInBrl,
    required TransactionType type,
    required String categoryId,
    required String description,
    required DateTime date,
  }) =>
      Transaction(
        id: id,
        value: value,
        currency: currency,
        exchangeRate: exchangeRate,
        valueInBrl: valueInBrl,
        type: type,
        categoryId: categoryId,
        description: description,
        date: date,
        isPendingSync: false,
      );

  static const Map<String, double> _mockRates = {
    'BRL': 1.0,
    'USD': 5.85,
    'EUR': 6.40,
    'GBP': 7.42,
    'ARS': 0.006,
  };

  static Transaction createExpense({
    required double value,
    required String currency,
    required String categoryId,
    required String description,
    DateTime? date,
  }) {
    final rate = _mockRates[currency] ?? 1.0;
    return Transaction(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      value: value,
      currency: currency,
      exchangeRate: rate,
      valueInBrl: value * rate,
      type: TransactionType.expense,
      categoryId: categoryId,
      description: description,
      date: date ?? DateTime.now(),
      isPendingSync: currency != 'BRL',
    );
  }

  static Transaction createIncome({
    required double value,
    required String currency,
    required String categoryId,
    required String description,
    DateTime? date,
  }) {
    final rate = _mockRates[currency] ?? 1.0;
    return Transaction(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      value: value,
      currency: currency,
      exchangeRate: rate,
      valueInBrl: value * rate,
      type: TransactionType.income,
      categoryId: categoryId,
      description: description,
      date: date ?? DateTime.now(),
      isPendingSync: currency != 'BRL',
    );
  }
}
