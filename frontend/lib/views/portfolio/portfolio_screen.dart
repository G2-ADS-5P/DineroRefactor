import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/widgets/charts/line_chart_widget.dart';
import 'package:dinero/widgets/common/asset_row.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PortfolioScreen extends ConsumerStatefulWidget {
  const PortfolioScreen({super.key});

  @override
  ConsumerState<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends ConsumerState<PortfolioScreen> {
  int _selectedPeriod = 4; // 1A
  final _periods = ['1D', '1S', '1M', '3M', '1A', 'Tudo'];

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(portfolioViewModelProvider);
    final isPositive = state.totalChange >= 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: state.isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Portfólio',
                          style: TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.w700)),
                      const Icon(Icons.search, color: AppColors.textSecondary),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    CurrencyFormatter.format(state.totalValue),
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 32, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: (isPositive ? AppColors.income : AppColors.expense).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${isPositive ? '+' : ''}${state.totalChange.toStringAsFixed(2)}%',
                          style: TextStyle(
                            color: isPositive ? AppColors.income : AppColors.expense,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const PortfolioLineChart(),
                  const SizedBox(height: 12),

                  // Period selector
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: _periods.asMap().entries.map((e) {
                      final isSelected = _selectedPeriod == e.key;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedPeriod = e.key),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary.withOpacity(0.15) : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            e.value,
                            style: TextStyle(
                              color: isSelected ? AppColors.primary : AppColors.textSecondary,
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  ElevatedButton.icon(
                    onPressed: () => context.push('/portfolio/pesquisar'),
                    icon: const Icon(Icons.search, size: 18),
                    label: const Text('Pesquisar ativos'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 20),

                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: state.assets.map((a) => AssetRow(
                        asset: a,
                        onTap: () => context.push('/portfolio/ativo/${a.id}'),
                      )).toList(),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
