import 'package:dinero/core/config/app_config.dart';
import 'package:dinero/core/network/api_client.dart';
import 'package:dinero/models/budget.dart';
import 'package:dinero/models/category.dart';
import 'package:dinero/repositories/interfaces/i_category_repository.dart';
import 'package:flutter/material.dart';

class HttpCategoryRepository implements ICategoryRepository {
  HttpCategoryRepository(this._client);

  final ApiClient _client;

  // TEMP: orçamentos locais até o backend expor endpoint de budget.
  static const Map<String, double> _budgetByName = {
    'Moradia': 2500.00,
    'Alimentação': 1000.00,
    'Alimentacao': 1000.00,
    'Transporte': 500.00,
    'Lazer': 400.00,
    'Assinaturas': 350.00,
    'Saúde': 300.00,
    'Saude': 300.00,
    'Educação': 200.00,
    'Educacao': 200.00,
  };

  @override
  Future<List<Category>> getAll() async {
    final raw = await _client.get(BackendService.financial, '/categories');
    final result = ApiClient.unwrapList(raw);
    return result.items.map(_mapCategory).toList();
  }

  @override
  Future<Category> create(Category category) async {
    final raw = await _client.post(
      BackendService.financial,
      '/categories',
      body: {
        'name': category.name,
        'type': category.type,
        'color': _colorToHex(category.color),
        'icon': category.emoji,
      },
    );
    return _mapCategory(ApiClient.unwrapItem(raw));
  }

  @override
  Future<Budget?> getBudget(String categoryId) async {
    final categories = await getAll();
    final match = categories.where((c) => c.id == categoryId).toList();
    if (match.isEmpty || match.first.budgetAmount == null) return null;
    return Budget(categoryId: categoryId, amount: match.first.budgetAmount!);
  }

  // TEMP: gasto real calculado pelo HttpTransactionRepository via balance/summary.
  @override
  Future<double> getSpentByCategory(String categoryId) async => 0;

  // ---------------------------------------------------------------------------

  Category _mapCategory(Map<String, dynamic> j) {
    final name = j['name'] as String? ?? '';
    return Category(
      id: j['id'] as String,
      name: name,
      emoji: _iconToEmoji(j['icon'] as String? ?? ''),
      color: _parseHex(j['color'] as String? ?? '#64748B'),
      isDefault: false,
      budgetAmount: _budgetByName[name],
      type: j['type'] as String? ?? 'expense',
    );
  }

  static String _colorToHex(Color c) {
    return '#${c.red.toRadixString(16).padLeft(2, '0')}${c.green.toRadixString(16).padLeft(2, '0')}${c.blue.toRadixString(16).padLeft(2, '0')}'.toUpperCase();
  }

  static Color _parseHex(String hex) {
    final clean = hex.replaceFirst('#', '');
    final padded = clean.length == 6 ? 'FF$clean' : clean;
    return Color(int.parse(padded, radix: 16));
  }

  static final Map<String, String> _iconMap = {
    'home': '🏠', 'house': '🏠', 'moradia': '🏠',
    'food': '🍔', 'restaurant': '🍔', 'alimentacao': '🍔', 'alimentação': '🍔',
    'car': '🚗', 'transport': '🚗', 'transporte': '🚗',
    'game': '🎮', 'entertainment': '🎮', 'lazer': '🎮',
    'phone': '📱', 'subscription': '📱', 'assinaturas': '📱',
    'health': '❤️', 'heart': '❤️', 'saude': '❤️', 'saúde': '❤️',
    'book': '📚', 'education': '📚', 'educacao': '📚', 'educação': '📚',
    'briefcase': '💼', 'outros': '💼', 'other': '💼',
  };

  static String _iconToEmoji(String icon) {
    if (icon.isEmpty) return '📁';
    final lower = icon.toLowerCase();
    return _iconMap[lower] ?? (icon.runes.first > 127 ? icon : '📁');
  }
}
