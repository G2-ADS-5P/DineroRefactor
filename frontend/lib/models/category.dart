import 'package:flutter/material.dart';

class Category {
  final String id;
  final String name;
  final String emoji;
  final Color color;
  final bool isDefault;
  final double? budgetAmount;

  const Category({
    required this.id,
    required this.name,
    required this.emoji,
    required this.color,
    required this.isDefault,
    this.budgetAmount,
  });
}
