import 'package:flutter/material.dart';

class Category {
  final String id;
  final String name;
  final String emoji;
  final Color color;
  final bool isDefault;
  final double? budgetAmount;
  final String type; // 'income' | 'expense'

  const Category({
    required this.id,
    required this.name,
    required this.emoji,
    required this.color,
    required this.isDefault,
    this.budgetAmount,
    this.type = 'expense',
  });
}
