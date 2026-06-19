import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/models/asset.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class PortfolioLineChart extends StatelessWidget {
  final List<PortfolioHistoryPoint> points;
  final String range;

  const PortfolioLineChart({
    super.key,
    this.points = const [],
    this.range = '1A',
  });

  @override
  Widget build(BuildContext context) {
    final chartPoints = points.isEmpty
        ? [PortfolioHistoryPoint(date: DateTime.now(), value: 0)]
        : points;
    final spots = chartPoints
        .asMap()
        .entries
        .map((entry) => FlSpot(entry.key.toDouble(), entry.value.value))
        .toList();
    final chartValues = chartPoints.map((point) => point.value).toList();
    final minY = chartValues.reduce((a, b) => a < b ? a : b);
    final maxY = chartValues.reduce((a, b) => a > b ? a : b);
    final spread = (maxY - minY).abs();
    final padding = spread == 0 ? 100.0 : spread * 0.15;
    final labelIndexes = _labelIndexes(chartPoints.length);
    final hasSinglePoint = chartPoints.length == 1;

    return SizedBox(
      height: 180,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: (spread / 3).clamp(1, double.infinity),
            getDrawingHorizontalLine: (_) =>
                const FlLine(color: AppColors.border, strokeWidth: 0.5),
          ),
          titlesData: FlTitlesData(
            leftTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            rightTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            topTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 28,
                interval: 1,
                getTitlesWidget: (value, meta) {
                  final idx = value.toInt();
                  if (value != idx.toDouble() ||
                      idx < 0 ||
                      idx >= chartPoints.length ||
                      !labelIndexes.contains(idx)) {
                    return const SizedBox.shrink();
                  }
                  return SideTitleWidget(
                    axisSide: meta.axisSide,
                    space: 8,
                    child: Text(
                      _formatDate(chartPoints[idx].date),
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 10,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          minX: hasSinglePoint ? -1 : 0,
          maxX: hasSinglePoint ? 1 : (chartPoints.length - 1).toDouble(),
          minY: minY - padding,
          maxY: maxY + padding,
          lineTouchData: LineTouchData(
            enabled: true,
            touchTooltipData: LineTouchTooltipData(
              maxContentWidth: 160,
              fitInsideHorizontally: true,
              fitInsideVertically: true,
              getTooltipColor: (_) => AppColors.surfaceAlt,
              getTooltipItems: (touchedSpots) => touchedSpots
                  .map(
                    (spot) => LineTooltipItem(
                      '${_formatDate(chartPoints[spot.x.toInt()].date)}\n'
                      '${CurrencyFormatter.format(spot.y)}',
                      const TextStyle(
                        color: AppColors.primary,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: AppColors.primary,
              barWidth: 2,
              dotData: FlDotData(show: hasSinglePoint),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.primary.withValues(alpha: 0.3),
                    AppColors.primary.withValues(alpha: 0),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Set<int> _labelIndexes(int length) {
    if (length <= 4) return Set<int>.from(List.generate(length, (i) => i));

    return {
      0,
      ((length - 1) / 3).round(),
      (((length - 1) * 2) / 3).round(),
      length - 1,
    };
  }

  String _formatDate(DateTime value) {
    final date = value.toLocal();
    if (range == '1A') return DateFormat('MM/yy').format(date);

    if (range == 'TUDO' && points.length > 1) {
      final elapsedDays = points.last.date.difference(points.first.date).inDays;
      if (elapsedDays > 730) return DateFormat('yyyy').format(date);
      if (elapsedDays > 180) return DateFormat('MM/yy').format(date);
    }

    return DateFormat('dd/MM').format(date);
  }
}
