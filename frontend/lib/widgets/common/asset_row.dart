import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/models/asset.dart';
import 'package:dinero/widgets/charts/sparkline_widget.dart';
import 'package:flutter/material.dart';

class AssetRow extends StatelessWidget {
  final Asset asset;
  final VoidCallback? onTap;

  const AssetRow({super.key, required this.asset, this.onTap});

  @override
  Widget build(BuildContext context) {
    final isPositive = asset.changePercent >= 0;
    final changeColor = isPositive ? AppColors.income : AppColors.expense;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AppColors.border, width: 0.5)),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  asset.ticker.substring(0, 2),
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(asset.ticker,
                      style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w600)),
                  Text(asset.name,
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
            ),
            SizedBox(
              width: 60,
              height: 30,
              child: SparklineWidget(
                  data: asset.priceHistory, isPositive: isPositive),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  CurrencyFormatter.format(asset.currentPrice),
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '${isPositive ? '+' : ''}${asset.changePercent.toStringAsFixed(2)}%',
                  style: TextStyle(color: changeColor, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
