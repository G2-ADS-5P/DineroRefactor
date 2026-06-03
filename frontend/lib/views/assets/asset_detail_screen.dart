import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/widgets/charts/sparkline_widget.dart';
import 'package:dinero/widgets/layout/page_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetDetailScreen extends ConsumerWidget {
  final String assetId;

  const AssetDetailScreen({super.key, required this.assetId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vm = ref.read(assetDetailViewModelProvider.notifier);
    final state = ref.watch(assetDetailViewModelProvider);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (state.isLoading) vm.load(assetId);
    });

    if (state.isLoading || state.asset == null) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    final asset = state.asset!;
    final isPositive = asset.changePercent >= 0;
    final changeColor = isPositive ? AppColors.income : AppColors.expense;

    return PageShell(
      title: asset.ticker,
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(asset.name, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                const SizedBox(height: 8),
                Text(CurrencyFormatter.format(asset.currentPrice),
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 32, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(
                  '${isPositive ? '+' : ''}${asset.changePercent.toStringAsFixed(2)}% hoje',
                  style: TextStyle(color: changeColor, fontSize: 14),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 80,
                  child: SparklineWidget(data: asset.priceHistory, isPositive: isPositive),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _Row('Quantidade', '${asset.quantity} cotas'),
                const Divider(color: AppColors.border, height: 20),
                _Row('Preço atual', CurrencyFormatter.format(asset.currentPrice)),
                const Divider(color: AppColors.border, height: 20),
                _Row('Total', CurrencyFormatter.format(asset.totalValue)),
                const Divider(color: AppColors.border, height: 20),
                _Row('Variação', '${isPositive ? '+' : ''}${asset.changePercent.toStringAsFixed(2)}%', valueColor: changeColor),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _Row(this.label, this.value, {this.valueColor});

  @override
  Widget build(BuildContext context) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
          Text(value, style: TextStyle(color: valueColor ?? AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
        ],
      );
}
