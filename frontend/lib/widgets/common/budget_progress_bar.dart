import 'package:dinero/core/theme/app_colors.dart';
import 'package:flutter/material.dart';

class BudgetProgressBar extends StatelessWidget {
  final double percent;
  final Color color;

  const BudgetProgressBar({
    super.key,
    required this.percent,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final clamped = percent.clamp(0.0, 1.0);
    return ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: Container(
        height: 6,
        color: AppColors.surfaceAlt,
        child: FractionallySizedBox(
          alignment: Alignment.centerLeft,
          widthFactor: clamped,
          child: Container(color: color),
        ),
      ),
    );
  }
}
