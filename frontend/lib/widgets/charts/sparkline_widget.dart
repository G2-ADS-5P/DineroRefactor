import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class SparklineWidget extends StatelessWidget {
  final List<double> data;
  final List<DateTime> dates;
  final bool isPositive;
  final bool showDateLabels;
  final bool enableTooltip;

  const SparklineWidget({
    super.key,
    required this.data,
    this.dates = const [],
    required this.isPositive,
    this.showDateLabels = false,
    this.enableTooltip = false,
  });

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const SizedBox.shrink();
    final color = isPositive ? AppColors.income : AppColors.expense;
    final spots = data
        .asMap()
        .entries
        .map((e) => FlSpot(e.key.toDouble(), e.value))
        .toList();
    final hasDates = dates.length == data.length && dates.isNotEmpty;
    final showDates = showDateLabels && hasDates;
    final labelIndexes = _labelIndexes(data.length);

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: showDates
            ? FlTitlesData(
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
                      final index = value.toInt();
                      if (value != index.toDouble() ||
                          index < 0 ||
                          index >= dates.length ||
                          !labelIndexes.contains(index)) {
                        return const SizedBox.shrink();
                      }

                      return SideTitleWidget(
                        axisSide: meta.axisSide,
                        space: 8,
                        child: Text(
                          _formatAxisDate(dates[index]),
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 10,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              )
            : const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        lineTouchData: enableTooltip && hasDates
            ? LineTouchData(
                enabled: true,
                touchTooltipData: LineTouchTooltipData(
                  maxContentWidth: 170,
                  fitInsideHorizontally: true,
                  fitInsideVertically: true,
                  getTooltipColor: (_) => AppColors.surfaceAlt,
                  getTooltipItems: (touchedSpots) => touchedSpots
                      .map(
                        (spot) => LineTooltipItem(
                          '${_formatTooltipDate(dates[spot.x.toInt()])}\n'
                          '${CurrencyFormatter.format(spot.y)}',
                          TextStyle(
                            color: color,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      )
                      .toList(),
                ),
              )
            : const LineTouchData(enabled: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: color,
            barWidth: 1.5,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(show: false),
          ),
        ],
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

  bool get _isIntraday =>
      dates.length > 1 && dates.last.difference(dates.first).inHours <= 24;

  String _formatAxisDate(DateTime value) {
    final date = value.toLocal();
    return DateFormat(_isIntraday ? 'HH:mm' : 'dd/MM').format(date);
  }

  String _formatTooltipDate(DateTime value) {
    final date = value.toLocal();
    return DateFormat(_isIntraday ? 'dd/MM HH:mm' : 'dd/MM/yyyy').format(date);
  }
}
