import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/viewmodels/categories_viewmodel.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class DonutChartWidget extends StatefulWidget {
  final List<CategoryStat> stats;
  final double totalSpent;

  const DonutChartWidget({
    super.key,
    required this.stats,
    required this.totalSpent,
  });

  @override
  State<DonutChartWidget> createState() => _DonutChartWidgetState();
}

class _DonutChartWidgetState extends State<DonutChartWidget> {
  bool _animated = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _animated = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final filtered = widget.stats.where((s) => s.spent > 0).toList();
    if (filtered.isEmpty) {
      return const SizedBox(
        height: 200,
        child: Center(
          child: Text('Sem gastos', style: TextStyle(color: AppColors.textSecondary)),
        ),
      );
    }

    final sections = filtered.map((s) {
      final pct = widget.totalSpent > 0 ? s.spent / widget.totalSpent : 0.0;
      return PieChartSectionData(
        color: s.category.color,
        value: s.spent,
        title: _animated ? '${(pct * 100).toStringAsFixed(0)}%' : '',
        radius: _animated ? 50 : 0,
        titleStyle: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      );
    }).toList();

    return SizedBox(
      height: 220,
      child: Stack(
        alignment: Alignment.center,
        children: [
          PieChart(
            PieChartData(
              sections: sections,
              centerSpaceRadius: 70,
              sectionsSpace: 2,
            ),
            swapAnimationDuration: const Duration(milliseconds: 900),
            swapAnimationCurve: Curves.easeOutCubic,
          ),
          AnimatedOpacity(
            opacity: _animated ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 600),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Total gasto',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 4),
                Text(
                  CurrencyFormatter.format(widget.totalSpent),
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
