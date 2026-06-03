enum TransactionType { income, expense }

class Transaction {
  final String id;
  final double value;
  final String currency;
  final double exchangeRate;
  final double valueInBrl;
  final TransactionType type;
  final String categoryId;
  final String description;
  final DateTime date;
  final bool isPendingSync;

  const Transaction({
    required this.id,
    required this.value,
    required this.currency,
    required this.exchangeRate,
    required this.valueInBrl,
    required this.type,
    required this.categoryId,
    required this.description,
    required this.date,
    this.isPendingSync = false,
  });
}
