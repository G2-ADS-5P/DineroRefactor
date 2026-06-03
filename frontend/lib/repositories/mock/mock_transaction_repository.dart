import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';

class MockTransactionRepository implements ITransactionRepository {
  final List<Transaction> _data = List.from(MockData.transactions);

  @override
  Future<List<Transaction>> getAll() async => List.from(_data)
    ..sort((a, b) => b.date.compareTo(a.date));

  @override
  Future<void> save(Transaction transaction) async {
    _data.add(transaction);
  }

  @override
  Future<void> delete(String id) async {
    _data.removeWhere((t) => t.id == id);
  }

  @override
  Future<double> getTotalBalance() async {
    double income = 0;
    double expenses = 0;
    for (final t in _data) {
      if (t.type == TransactionType.income) {
        income += t.valueInBrl;
      } else {
        expenses += t.valueInBrl;
      }
    }
    return income - expenses;
  }

  @override
  Future<double> getMonthlyIncome() async {
    final now = DateTime(2026, 3, 24);
    double total = 0;
    for (final t in _data) {
      if (t.type == TransactionType.income &&
          t.date.year == now.year &&
          t.date.month == now.month) {
        total += t.valueInBrl;
      }
    }
    return total;
  }

  @override
  Future<double> getMonthlyExpenses() async {
    final now = DateTime(2026, 3, 24);
    double total = 0;
    for (final t in _data) {
      if (t.type == TransactionType.expense &&
          t.date.year == now.year &&
          t.date.month == now.month) {
        total += t.valueInBrl;
      }
    }
    return total;
  }

  @override
  Future<double> getMonthlySpentByCategory(String categoryId) async {
    final now = DateTime(2026, 3, 24);
    double total = 0;
    for (final t in _data) {
      if (t.type == TransactionType.expense &&
          t.categoryId == categoryId &&
          t.date.year == now.year &&
          t.date.month == now.month) {
        total += t.valueInBrl;
      }
    }
    return total;
  }
}
