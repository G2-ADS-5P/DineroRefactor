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
  int _selectedPeriod = 4;
  final _periods = ['1D', '1S', '1M', '3M', '1A', 'Tudo'];
  final _apiPeriods = ['1D', '1S', '1M', '3M', '1A', 'TUDO'];

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(portfolioViewModelProvider);
    final vm = ref.read(portfolioViewModelProvider.notifier);
    final isPositive = state.totalChange >= 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: state.isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Portfólio',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      IconButton(
                        onPressed: () => context.push('/portfolio/pesquisar'),
                        icon: const Icon(
                          Icons.search,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  if (state.errorMessage != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      state.errorMessage!,
                      style: const TextStyle(
                        color: AppColors.danger,
                        fontSize: 13,
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  const Text(
                    'Valor total investido',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    CurrencyFormatter.format(state.totalValue),
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 32,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    width: 84,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: (isPositive ? AppColors.income : AppColors.expense)
                          .withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${isPositive ? '+' : ''}${state.totalChange.toStringAsFixed(2)}%',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color:
                            isPositive ? AppColors.income : AppColors.expense,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  PortfolioLineChart(
                    points: state.history,
                    range: _apiPeriods[_selectedPeriod],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: _periods.asMap().entries.map((e) {
                      final isSelected = _selectedPeriod == e.key;
                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedPeriod = e.key);
                          vm.load(range: _apiPeriods[e.key]);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary.withValues(alpha: 0.15)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            e.value,
                            style: TextStyle(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                              fontSize: 13,
                              fontWeight: isSelected
                                  ? FontWeight.w700
                                  : FontWeight.w400,
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
                    child: state.assets.isEmpty
                        ? const Padding(
                            padding: EdgeInsets.all(20),
                            child: Center(
                              child: Text(
                                'Nenhum ativo no portfólio',
                                style: TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          )
                        : Column(
                            children: state.assets
                                .map(
                                  (asset) => AssetRow(
                                    asset: asset,
                                    onTap: () => context.push(
                                      '/portfolio/ativo/${asset.id}',
                                    ),
                                  ),
                                )
                                .toList(),
                          ),
                  ),
                ],
              ),
      ),
    );
  }
}
