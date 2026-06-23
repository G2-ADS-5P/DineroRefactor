import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/models/card_model.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/widgets/layout/page_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

class CardsScreen extends ConsumerWidget {
  const CardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final state = ref.watch(cardsViewModelProvider);

    return PageShell(
      title: 'Cartões',
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: GestureDetector(
            onTap: () => _showConnectOpenFinance(context, colors),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: colors.surfaceAlt,
                shape: BoxShape.circle,
                border: Border.all(color: colors.border),
              ),
              child: Icon(Icons.add, color: colors.textPrimary, size: 20),
            ),
          ),
        ),
      ],
      body: Column(
        children: [
          // Banner OpenFinance
          GestureDetector(
            onTap: () => _showConnectOpenFinance(context, colors),
            child: Container(
              margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
                border:
                    Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.account_balance_outlined,
                        color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Conectar ao Open Finance',
                            style: TextStyle(
                              color: colors.textPrimary,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            )),
                        Text('Importe automaticamente gastos dos seus bancos',
                            style: TextStyle(
                                color: colors.textSecondary, fontSize: 12)),
                      ],
                    ),
                  ),
                  Icon(Icons.chevron_right, color: colors.textMuted, size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              itemCount: state.cards.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (_, i) => _CardItem(
                card: state.cards[i],
                onSimulate: () =>
                    _showSimulateDialog(context, ref, state.cards[i], colors),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showConnectOpenFinance(BuildContext context, AppColors colors) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => const _OpenFinanceSheet(),
    );
  }

  void _showSimulateDialog(
      BuildContext context, WidgetRef ref, CardModel card, AppColors colors) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: colors.surface,
        title: Text('Simular gasto — ${card.name}',
            style: TextStyle(
                color: colors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w600)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Simula um gasto automático como se viesse do Open Finance.',
              style: TextStyle(color: colors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              autofocus: true,
              style: TextStyle(color: colors.textPrimary),
              decoration: InputDecoration(
                prefixText: 'R\$  ',
                prefixStyle: TextStyle(color: colors.textSecondary),
                hintText: '0,00',
                hintStyle: TextStyle(color: colors.textMuted),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child:
                Text('Cancelar', style: TextStyle(color: colors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              final raw = controller.text.replaceAll(',', '.');
              final value = double.tryParse(raw);
              if (value == null || value <= 0) return;
              Navigator.pop(ctx);
              await ref.read(financeFacadeProvider).registerExpense(
                    value: value,
                    currency: 'BRL',
                    categoryId: '',
                    description: 'Open Finance — ${card.name}',
                  );
              ref.read(dashboardViewModelProvider.notifier).refresh();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text(
                      'Gasto de ${CurrencyFormatter.format(value)} importado do ${card.name}'),
                  backgroundColor: AppColors.primary,
                  duration: const Duration(seconds: 2),
                ));
              }
            },
            child:
                const Text('Confirmar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

class _CardItem extends StatelessWidget {
  final CardModel card;
  final VoidCallback onSimulate;

  const _CardItem({required this.card, required this.onSimulate});

  String _formatDueDate(int dueDays) {
    final due = DateTime(2026, 3, 17).add(Duration(days: dueDays));
    final formatted = DateFormat("d MMM", 'pt_BR').format(due);
    final parts = formatted.split(' ');
    if (parts.length == 2) {
      return '${parts[0]} ${parts[1][0].toUpperCase()}${parts[1].substring(1).replaceAll('.', '')}';
    }
    return formatted;
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final progress = (card.creditLimit != null && card.creditLimit! > 0)
        ? (card.currentBill / card.creditLimit!).clamp(0.0, 1.0)
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            card.color.withValues(alpha: 0.30),
            card.color.withValues(alpha: 0.07),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: card.color.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.credit_card,
                        color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        card.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                card.network,
                style: TextStyle(
                  color: colors.textSecondary,
                  fontSize: 12,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          if (card.isOpenFinance) ...[
            const SizedBox(height: 6),
            const Row(
              children: [
                Icon(Icons.account_balance, color: AppColors.primary, size: 12),
                SizedBox(width: 4),
                Text(
                  'Open Finance',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),
          Text(
            '•••• •••• •••• ${card.lastFour}',
            style: TextStyle(
                color: colors.textSecondary, fontSize: 14, letterSpacing: 2),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    card.isDebit ? 'Saldo' : 'Fatura atual',
                    style: TextStyle(color: colors.textSecondary, fontSize: 12),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    CurrencyFormatter.format(card.currentBill),
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              if (card.creditLimit != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('Limite',
                        style: TextStyle(
                            color: colors.textSecondary, fontSize: 12)),
                    const SizedBox(height: 2),
                    Text(
                      CurrencyFormatter.format(card.creditLimit!),
                      style: TextStyle(
                          color: colors.textSecondary,
                          fontSize: 13,
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
            ],
          ),
          if (!card.isDebit && card.creditLimit != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.white.withValues(alpha: 0.12),
                valueColor:
                    const AlwaysStoppedAnimation<Color>(AppColors.primary),
                minHeight: 4,
              ),
            ),
          ],
          if (!card.isDebit) ...[
            const SizedBox(height: 12),
            Text(
              'Vencimento: ${_formatDueDate(card.dueDays)}',
              style: TextStyle(color: colors.textSecondary, fontSize: 12),
            ),
          ],
          const SizedBox(height: 14),
          // Simulate button
          GestureDetector(
            onTap: onSimulate,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 9),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white.withValues(alpha: 0.20)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bolt, color: Colors.white, size: 16),
                  SizedBox(width: 6),
                  Text(
                    'Simular gasto Open Finance',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OpenFinanceSheet extends ConsumerStatefulWidget {
  const _OpenFinanceSheet();

  @override
  ConsumerState<_OpenFinanceSheet> createState() => _OpenFinanceSheetState();
}

enum _SheetPhase { select, loading, found }

class _OpenFinanceSheetState extends ConsumerState<_OpenFinanceSheet> {
  _SheetPhase _phase = _SheetPhase.select;
  String _selectedBank = '';
  List<CardModel> _foundCards = [];

  static const _banks = [
    {'name': 'Nubank', 'icon': Icons.credit_card},
    {'name': 'Itaú', 'icon': Icons.account_balance},
    {'name': 'Bradesco', 'icon': Icons.account_balance},
    {'name': 'Banco do Brasil', 'icon': Icons.account_balance},
    {'name': 'Santander', 'icon': Icons.account_balance},
    {'name': 'Inter', 'icon': Icons.credit_card},
    {'name': 'C6 Bank', 'icon': Icons.credit_card},
    {'name': 'XP Investimentos', 'icon': Icons.trending_up},
  ];

  Future<void> _connectTo(String bankName) async {
    setState(() {
      _selectedBank = bankName;
      _phase = _SheetPhase.loading;
    });
    await Future.delayed(const Duration(milliseconds: 2400));
    final cards = ref
        .read(cardsViewModelProvider.notifier)
        .previewOpenFinanceCards(bankName);
    if (mounted) {
      setState(() {
        _foundCards = cards;
        _phase = _SheetPhase.found;
      });
    }
  }

  void _importCards() {
    ref.read(cardsViewModelProvider.notifier).importCards(_foundCards);
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content:
          Text('${_foundCards.length} cartões importados do $_selectedBank'),
      backgroundColor: AppColors.primary,
      duration: const Duration(seconds: 2),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Container(
      height: MediaQuery.of(context).size.height * 0.72,
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                  color: colors.border, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.account_balance_outlined,
                    color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Open Finance',
                        style: TextStyle(
                            color: colors.textPrimary,
                            fontSize: 18,
                            fontWeight: FontWeight.w700)),
                    Text(
                      _phase == _SheetPhase.select
                          ? 'Selecione seu banco para conectar'
                          : _phase == _SheetPhase.loading
                              ? 'Conectando com $_selectedBank...'
                              : '${_foundCards.length} cartões encontrados',
                      style:
                          TextStyle(color: colors.textSecondary, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (_phase == _SheetPhase.select)
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 2.5,
                ),
                itemCount: _banks.length,
                itemBuilder: (_, i) {
                  final bank = _banks[i];
                  return GestureDetector(
                    onTap: () => _connectTo(bank['name'] as String),
                    child: Container(
                      decoration: BoxDecoration(
                        color: colors.surfaceAlt,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: colors.border),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(bank['icon'] as IconData,
                              color: AppColors.primary, size: 18),
                          const SizedBox(width: 8),
                          Text(bank['name'] as String,
                              style: TextStyle(
                                  color: colors.textPrimary,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            )
          else if (_phase == _SheetPhase.loading)
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 56,
                    height: 56,
                    child: CircularProgressIndicator(
                        color: AppColors.primary, strokeWidth: 3),
                  ),
                  const SizedBox(height: 24),
                  Text('Autenticando com $_selectedBank',
                      style: TextStyle(
                          color: colors.textPrimary,
                          fontSize: 15,
                          fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Text('Buscando contas e cartões...',
                      style:
                          TextStyle(color: colors.textSecondary, fontSize: 13)),
                  const SizedBox(height: 28),
                  ...[
                    'Autenticação OAuth',
                    'Buscando contas',
                    'Carregando transações'
                  ].map(
                    (step) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 5),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                              width: 14,
                              height: 14,
                              child: CircularProgressIndicator(
                                  color: AppColors.primary, strokeWidth: 2)),
                          const SizedBox(width: 10),
                          Text(step,
                              style: TextStyle(
                                  color: colors.textMuted, fontSize: 12)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.check_circle,
                          color: AppColors.primary, size: 18),
                      const SizedBox(width: 8),
                      Text('Conexão estabelecida com $_selectedBank',
                          style: const TextStyle(
                              color: AppColors.primary,
                              fontSize: 13,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text('Cartões encontrados',
                      style: TextStyle(
                          color: colors.textSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.w500)),
                  const SizedBox(height: 10),
                  Expanded(
                    child: ListView.separated(
                      itemCount: _foundCards.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (_, i) {
                        final card = _foundCards[i];
                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: colors.surfaceAlt,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: card.color.withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: card.color.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(
                                  card.isDebit
                                      ? Icons.account_balance_wallet
                                      : Icons.credit_card,
                                  color: card.color,
                                  size: 18,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(card.name,
                                        style: TextStyle(
                                            color: colors.textPrimary,
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600)),
                                    Text(
                                      '•••• ${card.lastFour}  ·  ${card.network}  ·  ${card.isDebit ? 'Débito' : 'Crédito'}',
                                      style: TextStyle(
                                          color: colors.textSecondary,
                                          fontSize: 11),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.check_circle,
                                  color: AppColors.primary, size: 18),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _importCards,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        'Importar ${_foundCards.length} cartões',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
