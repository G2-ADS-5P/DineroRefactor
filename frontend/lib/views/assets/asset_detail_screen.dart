import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/models/asset.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/viewmodels/asset_detail_viewmodel.dart';
import 'package:dinero/widgets/charts/sparkline_widget.dart';
import 'package:dinero/widgets/layout/page_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetDetailScreen extends ConsumerWidget {
  final String assetId;
  final bool marketAsset;

  const AssetDetailScreen({
    super.key,
    required this.assetId,
    this.marketAsset = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final vm = ref.read(assetDetailViewModelProvider.notifier);
    final state = ref.watch(assetDetailViewModelProvider);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (state.isLoading) vm.load(assetId, marketAsset: marketAsset);
    });

    if (state.isLoading) {
      return Scaffold(
        backgroundColor: colors.background,
        body: const Center(
            child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (state.asset == null) {
      return PageShell(
        title: 'Ativo',
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  state.errorMessage ?? 'Ativo não encontrado.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: colors.textSecondary),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => vm.load(
                    assetId,
                    marketAsset: marketAsset,
                  ),
                  child: const Text('Tentar novamente'),
                ),
              ],
            ),
          ),
        ),
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
              color: colors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: colors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(asset.name,
                    style:
                        TextStyle(color: colors.textSecondary, fontSize: 14)),
                const SizedBox(height: 8),
                Text(CurrencyFormatter.format(asset.currentPrice),
                    style: TextStyle(
                        color: colors.textPrimary,
                        fontSize: 32,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(
                  '${isPositive ? '+' : ''}${asset.changePercent.toStringAsFixed(2)}% hoje',
                  style: TextStyle(color: changeColor, fontSize: 14),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 80,
                  child: SparklineWidget(
                    data: asset.priceHistory,
                    dates: asset.priceHistoryDates,
                    isPositive: isPositive,
                    enableTooltip: true,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: colors.border),
            ),
            child: Column(
              children: [
                _Row('Quantidade', '${asset.quantity} cotas'),
                Divider(color: colors.border, height: 20),
                _Row('Preço atual',
                    CurrencyFormatter.format(asset.currentPrice)),
                Divider(color: colors.border, height: 20),
                _Row('Total', CurrencyFormatter.format(asset.totalValue)),
                Divider(color: colors.border, height: 20),
                _Row('Variação',
                    '${isPositive ? '+' : ''}${asset.changePercent.toStringAsFixed(2)}%',
                    valueColor: changeColor),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: state.isProcessing
                      ? null
                      : () => _openTransactionDialog(
                            context,
                            vm,
                            asset,
                            isSale: false,
                          ),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Adicionar ativo'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: state.isProcessing || asset.quantity <= 0
                      ? null
                      : () => _openTransactionDialog(
                            context,
                            vm,
                            asset,
                            isSale: true,
                          ),
                  icon: const Icon(Icons.remove, size: 18),
                  label: const Text('Vender ativo'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: colors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sobre',
                  style: TextStyle(
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  asset.description ??
                      'Ainda não há informações adicionais sobre este ativo.',
                  style: TextStyle(
                    color: colors.textSecondary,
                    fontSize: 14,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openTransactionDialog(
    BuildContext context,
    AssetDetailViewModel viewModel,
    Asset asset, {
    required bool isSale,
  }) async {
    final completed = await showDialog<bool>(
      context: context,
      builder: (_) => _TransactionDialog(
        asset: asset,
        isSale: isSale,
        onSubmit: (quantity, unitPrice) async {
          final success = await viewModel.addTransaction(
            id: asset.id,
            marketAsset: marketAsset,
            ticker: asset.ticker,
            type: isSale ? 'VENDA' : 'COMPRA',
            quantity: quantity,
            unitPrice: unitPrice,
          );

          return success
              ? null
              : viewModel.errorMessage ??
                  'Não foi possível registrar a operação.';
        },
      ),
    );

    if (completed == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isSale
                ? 'Venda de ${asset.ticker} registrada.'
                : '${asset.ticker} adicionado ao portfólio.',
          ),
          backgroundColor: AppColors.primary,
        ),
      );
    }
  }
}

class _TransactionDialog extends StatefulWidget {
  final Asset asset;
  final bool isSale;
  final Future<String?> Function(int quantity, double unitPrice) onSubmit;

  const _TransactionDialog({
    required this.asset,
    required this.isSale,
    required this.onSubmit,
  });

  @override
  State<_TransactionDialog> createState() => _TransactionDialogState();
}

class _TransactionDialogState extends State<_TransactionDialog> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController(text: '1');
  late final TextEditingController _priceController;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _priceController = TextEditingController(
      text: widget.asset.currentPrice.toStringAsFixed(2),
    );
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return AlertDialog(
      backgroundColor: colors.surface,
      title: Text(
        '${widget.isSale ? 'Vender' : 'Adicionar'} ${widget.asset.ticker}',
        style: TextStyle(color: colors.textPrimary),
      ),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _quantityController,
              autofocus: true,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(labelText: 'Quantidade'),
              validator: (value) {
                final quantity = int.tryParse(value ?? '');
                if (quantity == null || quantity <= 0) {
                  return 'Informe uma quantidade válida.';
                }
                if (widget.isSale && quantity > widget.asset.quantity) {
                  return 'Disponível para venda: ${widget.asset.quantity}.';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _priceController,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[0-9,.]')),
              ],
              decoration: const InputDecoration(labelText: 'Preço unitário'),
              validator: (value) {
                final price =
                    double.tryParse((value ?? '').replaceAll(',', '.'));
                return price == null || price <= 0
                    ? 'Informe um preço válido.'
                    : null;
              },
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(color: AppColors.expense, fontSize: 12),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submit,
          child: _isSubmitting
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text(widget.isSale ? 'Confirmar venda' : 'Adicionar'),
        ),
      ],
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    final quantity = int.parse(_quantityController.text);
    final unitPrice = double.parse(_priceController.text.replaceAll(',', '.'));
    final error = await widget.onSubmit(quantity, unitPrice);

    if (!mounted) return;
    if (error == null) {
      Navigator.pop(context, true);
      return;
    }

    setState(() {
      _isSubmitting = false;
      _errorMessage = error;
    });
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _Row(this.label, this.value, {this.valueColor});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: TextStyle(color: colors.textSecondary, fontSize: 14)),
        Text(value,
            style: TextStyle(
                color: valueColor ?? colors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w600)),
      ],
    );
  }
}
