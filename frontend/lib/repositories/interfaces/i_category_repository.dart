import 'package:dinero/models/budget.dart';
import 'package:dinero/models/category.dart';

abstract class ICategoryRepository {
  Future<List<Category>> getAll();
  Future<Budget?> getBudget(String categoryId);
  Future<double> getSpentByCategory(String categoryId);
}
