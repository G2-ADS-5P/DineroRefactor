import 'package:dinero/core/patterns/factory/transaction_factory.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:dinero/repositories/interfaces/i_transaction_repository.dart';

class FinanceFacade {
  final ITransactionRepository _transactionRepo;
  final ICategoryRepository _categoryRepo;

  FinanceFacade(this._transactionRepo, this._categoryRepo);

  Future<Transaction> registerExpense({
    required double value,
    required String currency,
    required String categoryId,
    required String description,
  }) async {
    final transaction = TransactionFactory.createExpense(
      value: value,
      currency: currency,
      categoryId: categoryId,
      description: description,
    );
    await _transactionRepo.save(transaction);

    final budget = await _categoryRepo.getBudget(categoryId);
    if (budget != null) {
      final spent = await _transactionRepo.getMonthlySpentByCategory(categoryId);
      final percent = spent / budget.amount;
      if (percent >= 1.0) {
        // TODO: notificação alerta vermelho
      } else if (percent >= 0.8) {
        // TODO: notificação alerta amarelo
      }
    }
    return transaction;
  }

  Future<Transaction> registerIncome({
    required double value,
    required String currency,
    required String categoryId,
    required String description,
  }) async {
    final transaction = TransactionFactory.createIncome(
      value: value,
      currency: currency,
      categoryId: categoryId,
      description: description,
    );
    await _transactionRepo.save(transaction);
    return transaction;
  }

  Future<double> getTotalBalance() async =>
      _transactionRepo.getTotalBalance();

  Future<Map<String, double>> getMonthlyStats() async {
    final income = await _transactionRepo.getMonthlyIncome();
    final expenses = await _transactionRepo.getMonthlyExpenses();
    return {'income': income, 'expenses': expenses};
  }

  Future<List<Transaction>> getRecentTransactions({int limit = 5}) async {
    final all = await _transactionRepo.getAll();
    return all.take(limit).toList();
  }

  Future<List<Transaction>> getAllTransactions() async =>
      _transactionRepo.getAll();
}
