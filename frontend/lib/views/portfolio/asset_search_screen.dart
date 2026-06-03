import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/models/asset.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/widgets/charts/sparkline_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AssetSearchScreen extends ConsumerStatefulWidget {
  const AssetSearchScreen({super.key});

  @override
  ConsumerState<AssetSearchScreen> createState() => _AssetSearchScreenState();
}

class _AssetSearchScreenState extends ConsumerState<AssetSearchScreen> {
  final _searchController = TextEditingController();
  final _filters = ['Todos', 'Ações', 'FIIs', 'BDRs', 'ETFs', 'Cripto'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(assetSearchViewModelProvider);
    final vm = ref.read(assetSearchViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: const Icon(Icons.chevron_left,
                          color: AppColors.textPrimary, size: 22),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Pesquisar Ativos',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Search bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceAlt,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: vm.search,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: const InputDecoration(
                    hintText: 'Buscar por ticker ou nome...',
                    hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                    prefixIcon: Icon(Icons.search, color: AppColors.textMuted, size: 20),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Filter chips
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _filters.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final f = _filters[i];
                  final isSelected = state.selectedFilter == f;
                  return GestureDetector(
                    onTap: () => vm.setFilter(f),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary.withOpacity(0.15) : AppColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                          width: 1.5,
                        ),
                      ),
                      child: Text(
                        f,
                        style: TextStyle(
                          color: isSelected ? AppColors.primary : AppColors.textSecondary,
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 12),

            // Count
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                '${state.filteredAssets.length} ativo${state.filteredAssets.length != 1 ? 's' : ''} encontrado${state.filteredAssets.length != 1 ? 's' : ''}',
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Grid
            Expanded(
              child: state.filteredAssets.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.search_off, color: AppColors.textMuted, size: 48),
                          SizedBox(height: 12),
                          Text(
                            'Nenhum ativo encontrado',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                          ),
                        ],
                      ),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.78,
                      ),
                      itemCount: state.filteredAssets.length,
                      itemBuilder: (context, i) =>
                          _AssetCard(asset: state.filteredAssets[i]),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AssetCard extends StatelessWidget {
  final Asset asset;

  const _AssetCard({required this.asset});

  @override
  Widget build(BuildContext context) {
    final isPositive = asset.changePercent >= 0;
    final changeColor = isPositive ? AppColors.income : AppColors.expense;
    final typeLabel = asset.assetType?.label ?? 'Outros';

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Ticker + Price
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                asset.ticker,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                CurrencyFormatter.format(asset.currentPrice),
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 2),

          // Name + Change
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  asset.name,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.w400,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isPositive ? Icons.trending_up : Icons.trending_down,
                    color: changeColor,
                    size: 12,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    '${isPositive ? '+' : ''}${asset.changePercent.toStringAsFixed(2)}%',
                    style: TextStyle(
                      color: changeColor,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Sparkline
          Expanded(
            child: asset.priceHistory.isNotEmpty
                ? SparklineWidget(
                    data: asset.priceHistory,
                    isPositive: isPositive,
                  )
                : const SizedBox.shrink(),
          ),

          const SizedBox(height: 8),

          // Type chip + Add button
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.surfaceAlt,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  typeLabel,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${asset.ticker} adicionado ao portfólio'),
                      backgroundColor: AppColors.primary,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.primary.withOpacity(0.5)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.add, color: AppColors.primary, size: 12),
                      SizedBox(width: 3),
                      Text(
                        'Adicionar',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
