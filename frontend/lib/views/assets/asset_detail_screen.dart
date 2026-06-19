import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/models/asset.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/widgets/charts/sparkline_widget.dart';
import 'package:dinero/widgets/layout/page_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetDetailScreen extends ConsumerStatefulWidget {
  final String assetId;
  final bool marketAsset;

  const AssetDetailScreen({
    super.key,
    required this.assetId,
    this.marketAsset = false,
  });

  @override
  ConsumerState<AssetDetailScreen> createState() => _AssetDetailScreenState();
}

class _AssetDetailScreenState extends ConsumerState<AssetDetailScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(assetDetailViewModelProvider.notifier).load(
            widget.assetId,
            marketAsset: widget.marketAsset,
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(assetDetailViewModelProvider);

    if (!state.isLoading && state.asset == null) {
      return PageShell(
        title: 'Ativo',
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              state.errorMessage ?? 'Ativo não encontrado',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
          ),
        ),
      );
    }

    if (state.isLoading || state.asset == null) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    final asset = state.asset!;
    final isPositive = asset.changePercent >= 0;
    final changeColor = isPositive ? AppColors.income : AppColors.expense;
    final about = _assetDescription(asset);

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
                Text(
                  asset.name,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  CurrencyFormatter.format(asset.currentPrice),
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 32,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${isPositive ? '+' : ''}${asset.changePercent.toStringAsFixed(2)}% hoje',
                  style: TextStyle(color: changeColor, fontSize: 14),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 120,
                  child: asset.priceHistory.isEmpty
                      ? const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.show_chart,
                                color: AppColors.textMuted,
                                size: 24,
                              ),
                              SizedBox(height: 6),
                              Text(
                                'Histórico indisponível',
                                style: TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        )
                      : SparklineWidget(
                          data: asset.priceHistory,
                          dates: asset.priceHistoryDates,
                          isPositive: isPositive,
                          showDateLabels: true,
                          enableTooltip: true,
                        ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: asset.quantity == 0 || state.isProcessing
                      ? null
                      : () => _showTransactionDialog(
                            context,
                            ref,
                            asset,
                            'VENDA',
                          ),
                  icon: const Icon(Icons.remove_circle_outline, size: 18),
                  label: const Text('Vender'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.expense,
                    side: const BorderSide(color: AppColors.expense),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: state.isProcessing
                      ? null
                      : () => _showTransactionDialog(
                            context,
                            ref,
                            asset,
                            'COMPRA',
                          ),
                  icon: state.isProcessing
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.textPrimary,
                          ),
                        )
                      : const Icon(Icons.add_circle_outline, size: 18),
                  label: Text(state.isProcessing ? 'Processando' : 'Comprar'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
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
                _Row(
                  'Preço atual',
                  CurrencyFormatter.format(asset.currentPrice),
                ),
                const Divider(color: AppColors.border, height: 20),
                _Row('Total', CurrencyFormatter.format(asset.totalValue)),
                const Divider(color: AppColors.border, height: 20),
                _Row(
                  'Variação',
                  '${isPositive ? '+' : ''}${asset.changePercent.toStringAsFixed(2)}%',
                  valueColor: changeColor,
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Sobre',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  about,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showTransactionDialog(
    BuildContext context,
    WidgetRef ref,
    Asset asset,
    String type,
  ) async {
    final isSale = type == 'VENDA';
    final quantityController = TextEditingController(text: '1');
    final priceController = TextEditingController(
      text: asset.currentPrice.toStringAsFixed(2),
    );

    final input = await showDialog<_TransactionInput>(
      context: context,
      builder: (dialogContext) {
        String? errorMessage;

        return StatefulBuilder(
          builder: (context, setModalState) => AlertDialog(
            backgroundColor: AppColors.surface,
            title: Text(
              '${isSale ? 'Vender' : 'Comprar'} ${asset.ticker}',
              style: const TextStyle(color: AppColors.textPrimary),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (isSale) ...[
                  Text(
                    'Disponível: ${asset.quantity} cotas',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                TextField(
                  controller: quantityController,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: const InputDecoration(labelText: 'Quantidade'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: priceController,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: const InputDecoration(
                    labelText: 'Preço unitário',
                  ),
                ),
                if (errorMessage != null) ...[
                  const SizedBox(height: 10),
                  Text(
                    errorMessage!,
                    style: const TextStyle(
                      color: AppColors.expense,
                      fontSize: 12,
                    ),
                  ),
                ],
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(),
                child: const Text('Cancelar'),
              ),
              ElevatedButton(
                onPressed: () {
                  final quantity = int.tryParse(quantityController.text) ?? 0;
                  final price = double.tryParse(
                        priceController.text.replaceAll(',', '.'),
                      ) ??
                      0;

                  if (quantity <= 0 || price <= 0) {
                    setModalState(() {
                      errorMessage = 'Informe quantidade e preço válidos.';
                    });
                    return;
                  }
                  if (isSale && quantity > asset.quantity) {
                    setModalState(() {
                      errorMessage =
                          'A quantidade máxima para venda é ${asset.quantity}.';
                    });
                    return;
                  }

                  Navigator.of(dialogContext).pop(
                    _TransactionInput(quantity: quantity, unitPrice: price),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      isSale ? AppColors.expense : AppColors.primary,
                ),
                child: Text(isSale ? 'Confirmar venda' : 'Confirmar compra'),
              ),
            ],
          ),
        );
      },
    );

    quantityController.dispose();
    priceController.dispose();
    if (input == null || !context.mounted) return;

    final success =
        await ref.read(assetDetailViewModelProvider.notifier).addTransaction(
              id: widget.assetId,
              marketAsset: widget.marketAsset,
              ticker: asset.ticker,
              type: type,
              quantity: input.quantity,
              unitPrice: input.unitPrice,
            );
    if (!context.mounted) return;

    if (success) {
      await ref.read(portfolioViewModelProvider.notifier).load();
    }
    if (!context.mounted) return;

    final message = success
        ? '${isSale ? 'Venda' : 'Compra'} registrada com sucesso.'
        : ref.read(assetDetailViewModelProvider).errorMessage ??
            'Não foi possível registrar a operação.';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: success ? AppColors.primary : AppColors.expense,
      ),
    );
  }

  String _assetDescription(Asset asset) {
    final description = asset.description?.trim();
    if (description != null && description.isNotEmpty) {
      return description;
    }

    final type = asset.assetType?.label.toLowerCase() ?? 'ativo';
    return '${asset.ticker} é um $type presente na sua carteira. '
        'Acompanhe aqui sua quantidade, preço atual, valor total e variação.';
  }
}

class _TransactionInput {
  final int quantity;
  final double unitPrice;

  const _TransactionInput({
    required this.quantity,
    required this.unitPrice,
  });
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
          Text(
            label,
            style:
                const TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      );
}
