import 'package:dinero/models/transaction.dart';

abstract class ITransactionRepository {
  Future<List<Transaction>> getAll();
  Future<void> save(Transaction transaction);
  Future<void> delete(String id);
  Future<double> getTotalBalance();
  Future<double> getMonthlyIncome();
  Future<double> getMonthlyExpenses();
  Future<double> getMonthlySpentByCategory(String categoryId);
}
