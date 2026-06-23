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
    final colors = AppColors.of(context);
    final state = ref.watch(assetSearchViewModelProvider);
    final vm = ref.read(assetSearchViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: colors.background,
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
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: colors.border),
                      ),
                      child: Icon(Icons.chevron_left,
                          color: colors.textPrimary, size: 22),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Pesquisar Ativos',
                    style: TextStyle(
                      color: colors.textPrimary,
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
                  color: colors.surfaceAlt,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: colors.border),
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: vm.search,
                  style: TextStyle(color: colors.textPrimary, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Buscar por ticker ou nome...',
                    hintStyle: TextStyle(color: colors.textMuted, fontSize: 14),
                    prefixIcon:
                        Icon(Icons.search, color: colors.textMuted, size: 20),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
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
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary.withOpacity(0.15)
                            : colors.surfaceAlt,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : colors.border,
                          width: 1.5,
                        ),
                      ),
                      child: Text(
                        f,
                        style: TextStyle(
                          color: isSelected
                              ? AppColors.primary
                              : colors.textSecondary,
                          fontSize: 13,
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w400,
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
                style: TextStyle(
                  color: colors.textSecondary,
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Grid
            Expanded(
              child: state.isLoading && state.filteredAssets.isEmpty
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    )
                  : state.errorMessage != null && state.filteredAssets.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(
                              'Não foi possível carregar os ativos. Tente novamente.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: colors.textSecondary),
                            ),
                          ),
                        )
                      : state.filteredAssets.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.search_off,
                                      color: colors.textMuted, size: 48),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Nenhum ativo encontrado',
                                    style: TextStyle(
                                        color: colors.textSecondary,
                                        fontSize: 14),
                                  ),
                                ],
                              ),
                            )
                          : GridView.builder(
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                childAspectRatio: 0.78,
                              ),
                              itemCount: state.filteredAssets.length,
                              itemBuilder: (context, i) {
                                final asset = state.filteredAssets[i];
                                return _AssetCard(
                                  asset: asset,
                                  onLoadHistory: () => vm.loadHistory(asset.id),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AssetCard extends StatefulWidget {
  final Asset asset;
  final Future<AssetHistorySeries> Function() onLoadHistory;

  const _AssetCard({
    required this.asset,
    required this.onLoadHistory,
  });

  @override
  State<_AssetCard> createState() => _AssetCardState();
}

class _AssetCardState extends State<_AssetCard> {
  late List<double> _history;
  late List<DateTime> _historyDates;
  bool _isLoadingHistory = false;
  bool _historyFailed = false;

  @override
  void initState() {
    super.initState();
    _syncHistoryFromAsset();
  }

  @override
  void didUpdateWidget(covariant _AssetCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.asset.id != widget.asset.id) _syncHistoryFromAsset();
  }

  void _syncHistoryFromAsset() {
    _history = widget.asset.priceHistory;
    _historyDates = widget.asset.priceHistoryDates;
    _historyFailed = false;
  }

  Future<void> _loadHistory() async {
    if (_history.isNotEmpty || _isLoadingHistory || _historyFailed) return;

    setState(() => _isLoadingHistory = true);
    try {
      final series = await widget.onLoadHistory();
      if (!mounted) return;
      setState(() {
        _history = series.values;
        _historyDates = series.dates;
        _isLoadingHistory = false;
        _historyFailed = series.values.isEmpty;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isLoadingHistory = false;
        _historyFailed = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final asset = widget.asset;
    final isPositive = asset.changePercent >= 0;
    final changeColor = isPositive ? AppColors.income : AppColors.expense;
    final typeLabel = asset.assetType?.label ?? 'Outros';

    return MouseRegion(
      onEnter: (_) => _loadHistory(),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => context.push(
          '/portfolio/pesquisar/ativo/${Uri.encodeComponent(asset.id)}',
        ),
        child: Container(
          decoration: BoxDecoration(
            color: colors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: colors.border),
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
                    style: TextStyle(
                      color: colors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    CurrencyFormatter.format(asset.currentPrice),
                    style: TextStyle(
                      color: colors.textPrimary,
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
                      style: TextStyle(
                        color: colors.textSecondary,
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
              Expanded(child: _buildHistory(colors, isPositive)),

              const SizedBox(height: 8),

              // Type chip
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: colors.surfaceAlt,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: colors.border),
                    ),
                    child: Text(
                      typeLabel,
                      style: TextStyle(
                        color: colors.textSecondary,
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHistory(AppColors colors, bool isPositive) {
    if (_isLoadingHistory) {
      return const Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      );
    }

    if (_history.isNotEmpty) {
      return SparklineWidget(
        data: _history,
        dates: _historyDates,
        isPositive: isPositive,
        enableTooltip: true,
      );
    }

    return Center(
      child: Text(
        _historyFailed
            ? 'Histórico indisponível'
            : 'Passe o mouse para ver a evolução',
        textAlign: TextAlign.center,
        style: TextStyle(color: colors.textMuted, fontSize: 10),
      ),
    );
  }
}
