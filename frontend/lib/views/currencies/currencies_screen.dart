import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/providers/providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CurrenciesScreen extends ConsumerWidget {
  const CurrenciesScreen({super.key});

  // Mock change percentages (simulando variação do dia)
  static const Map<String, double> _changes = {
    'USD': -0.3,
    'EUR': 0.2,
    'GBP': -0.1,
    'ARS': -1.2,
    'BTC': 3.4,
    'ETH': 2.1,
  };

  // Badge labels (2-letter country/crypto code)
  static final Map<String, String> _badges = {
    'USD': 'US',
    'EUR': 'EU',
    'GBP': 'GB',
    'ARS': 'AR',
    'BTC': 'B',
    'ETH': 'E',
  };

  String _formatRate(double rate, String code) {
    if (code == 'BTC') {
      return 'R\$ ${_formatNumber(rate, 2)}';
    }
    if (code == 'ETH') {
      return 'R\$ ${_formatNumber(rate, 2)}';
    }
    if (rate < 1) {
      return 'R\$ ${rate.toStringAsFixed(4)}';
    }
    return 'R\$ ${_formatNumber(rate, 2)}';
  }

  String _formatNumber(double value, int decimals) {
    final parts = value.toStringAsFixed(decimals).split('.');
    final intPart = parts[0].replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+$)'),
      (m) => '${m[1]}.',
    );
    return '$intPart,${parts[1]}';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(currenciesViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              color: AppColors.textPrimary, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Cotações',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: const Icon(
                Icons.refresh_rounded,
                color: AppColors.textSecondary,
                size: 20,
              ),
            ),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Subtitle
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                  child: Row(
                    children: const [
                      Text(
                        'Atualizado há 12 min · ',
                        style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 12,
                        ),
                      ),
                      Text(
                        'AwesomeAPI',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    itemCount: state.currencies
                        .where((c) => c.code != 'BRL')
                        .length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      final currencies = state.currencies
                          .where((c) => c.code != 'BRL')
                          .toList();
                      final c = currencies[i];
                      final change = _changes[c.code] ?? 0.0;
                      final isPositive = change >= 0;
                      final changeColor = isPositive
                          ? AppColors.income
                          : AppColors.expense;
                      final badge = _badges[c.code] ?? c.code.substring(0, 2);

                      return Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            // Badge circle
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: AppColors.surfaceAlt,
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Center(
                                child: Text(
                                  badge,
                                  style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(width: 14),

                            // Pair + Rate
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${c.code}/BRL',
                                    style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    '1 ${c.code} = ${_formatRate(c.rateToBase, c.code)}',
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Change %
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  isPositive
                                      ? Icons.trending_up_rounded
                                      : Icons.trending_down_rounded,
                                  color: changeColor,
                                  size: 16,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  '${isPositive ? '+' : ''}${change.toStringAsFixed(1)}%',
                                  style: TextStyle(
                                    color: changeColor,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}
