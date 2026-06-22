import 'package:dinero/core/config/app_config.dart';
import 'package:dinero/core/network/api_client.dart';
import 'package:dinero/core/patterns/factory/transaction_factory.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';

class HttpTransactionRepository implements ITransactionRepository {
  HttpTransactionRepository(this._client);

  final ApiClient _client;

  @override
  Future<List<Transaction>> getAll() async {
    final raw = await _client.get(
      BackendService.financial,
      '/transactions',
      query: {'_page': '1', '_size': '100'},
    );
    final result = ApiClient.unwrapList(raw);
    final list = result.items.map(_mapTransaction).toList()
      ..sort((a, b) => b.date.compareTo(a.date));
    return list;
  }

  @override
  Future<void> save(Transaction t) async {
    await _client.post(
      BackendService.financial,
      '/transactions',
      body: {
        'amount': t.value,
        'currency': t.currency,
        'amountBrl': t.valueInBrl,
        'exchangeRate': t.exchangeRate,
        'type': t.type == TransactionType.income ? 'income' : 'expense',
        'description': t.description,
        'date': t.date.toUtc().toIso8601String(),
        if (t.cardId != null) 'cardId': t.cardId,
        if (t.categoryId.isNotEmpty) 'categoryId': t.categoryId,
      },
    );
  }

  @override
  Future<void> delete(String id) async {
    await _client.delete(BackendService.financial, '/transactions/$id');
  }

  @override
  Future<double> getTotalBalance() async {
    final summary = await _fetchSummary(
      startDate: '2000-01-01T00:00:00.000Z',
      endDate: DateTime.now().toUtc().toIso8601String(),
    );
    return _toDouble(summary['netBalance'] ?? 0);
  }

  @override
  Future<double> getMonthlyIncome() async {
    final summary = await _fetchSummary(
      startDate: _firstDayOfMonth(),
      endDate: _lastDayOfMonth(),
    );
    final byType = summary['byType'] as Map<String, dynamic>? ?? {};
    return _toDouble(byType['income'] ?? 0);
  }

  @override
  Future<double> getMonthlyExpenses() async {
    final summary = await _fetchSummary(
      startDate: _firstDayOfMonth(),
      endDate: _lastDayOfMonth(),
    );
    final byType = summary['byType'] as Map<String, dynamic>? ?? {};
    return _toDouble(byType['expense'] ?? 0);
  }

  @override
  Future<double> getMonthlySpentByCategory(String categoryId) async {
    final totals = await getMonthlySpentByCategories();
    return totals[categoryId] ?? 0;
  }

  @override
  Future<Map<String, double>> getMonthlySpentByCategories() async {
    final summary = await _fetchSummary(
      startDate: _firstDayOfMonth(),
      endDate: _lastDayOfMonth(),
    );
    final byCategory = summary['byCategory'] as List<dynamic>? ?? [];
    final totals = <String, double>{};
    for (final entry in byCategory) {
      final e = entry as Map<String, dynamic>;
      final categoryId = e['categoryId']?.toString();
      if (categoryId != null) {
        totals[categoryId] = _toDouble(e['totalExpense'] ?? 0);
      }
    }
    return totals;
  }

  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> _fetchSummary({
    required String startDate,
    required String endDate,
  }) async {
    final raw = await _client.get(
      BackendService.financial,
      '/balance/summary',
      query: {'startDate': startDate, 'endDate': endDate},
    );
    return ApiClient.unwrapItem(raw);
  }

  Transaction _mapTransaction(Map<String, dynamic> j) {
    return TransactionFactory.fromBackend(
      id: j['id'] as String,
      value: _toDouble(j['amount']),
      currency: j['currency'] as String? ?? 'BRL',
      exchangeRate: _toDouble(j['exchangeRate'] ?? 1),
      valueInBrl: _toDouble(j['amountBrl'] ?? j['amount']),
      type: _mapType(j['type'] as String? ?? 'expense'),
      cardId: j['cardId'] as String?,
      categoryId: j['categoryId'] as String? ?? '',
      description: j['description'] as String? ?? '',
      date: DateTime.parse(j['date'] as String),
    );
  }

  static TransactionType _mapType(String raw) =>
      raw == 'income' ? TransactionType.income : TransactionType.expense;

  static double _toDouble(dynamic v) {
    if (v is num) return v.toDouble();
    if (v is String) return double.parse(v);
    return 0;
  }

  String _firstDayOfMonth() {
    final now = DateTime.now();
    return DateTime.utc(now.year, now.month, 1).toIso8601String();
  }

  String _lastDayOfMonth() {
    final now = DateTime.now();
    final last = DateTime.utc(now.year, now.month + 1, 1)
        .subtract(const Duration(seconds: 1));
    return last.toIso8601String();
  }
}
