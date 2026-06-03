import 'package:dinero/core/theme/app_colors.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class PortfolioLineChart extends StatelessWidget {
  const PortfolioLineChart({super.key});

  @override
  Widget build(BuildContext context) {
    final spots = [
      const FlSpot(0, 18000),
      const FlSpot(1, 19500),
      const FlSpot(2, 18800),
      const FlSpot(3, 21000),
      const FlSpot(4, 20500),
      const FlSpot(5, 22000),
      const FlSpot(6, 21800),
      const FlSpot(7, 23500),
      const FlSpot(8, 24000),
      const FlSpot(9, 23200),
      const FlSpot(10, 24500),
      const FlSpot(11, 24857),
    ];

    return SizedBox(
      height: 180,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: 3000,
            getDrawingHorizontalLine: (_) => const FlLine(
              color: AppColors.border,
              strokeWidth: 0.5,
            ),
          ),
          titlesData: FlTitlesData(
            leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: 2,
                getTitlesWidget: (value, meta) {
                  const months = ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev'];
                  final idx = value.toInt();
                  if (idx < 0 || idx >= months.length) return const SizedBox.shrink();
                  return Text(
                    months[idx],
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                  );
                },
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          lineTouchData: const LineTouchData(enabled: true),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: AppColors.primary,
              barWidth: 2,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.primary.withOpacity(0.3),
                    AppColors.primary.withOpacity(0.0),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
