import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/widgets/common/transaction_item.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final state = ref.watch(dashboardViewModelProvider);

    final userAsync = ref.watch(userProvider);
    final userName = userAsync.valueOrNull?.name.split(' ').first ?? '';
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: state.isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : RefreshIndicator(
                color: AppColors.primary,
                backgroundColor: colors.surface,
                onRefresh: () => ref.read(dashboardViewModelProvider.notifier).refresh(),
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('$greeting,', style: TextStyle(color: colors.textSecondary, fontSize: 14)),
                            Text(userName, style: TextStyle(color: colors.textPrimary, fontSize: 22, fontWeight: FontWeight.w700)),
                          ],
                        ),
                        IconButton(
                          icon: Icon(Icons.notifications_outlined, color: colors.textPrimary),
                          onPressed: () => context.push('/config/notificacoes'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Balance card
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
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'SALDO TOTAL',
                                style: TextStyle(color: colors.textSecondary, fontSize: 12, letterSpacing: 1),
                              ),
                              GestureDetector(
                                onTap: () => ref.read(dashboardViewModelProvider.notifier).toggleBalanceVisibility(),
                                child: Icon(
                                  state.balanceHidden
                                      ? Icons.visibility_outlined
                                      : Icons.visibility_off_outlined,
                                  color: colors.textMuted,
                                  size: 20,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              if (state.balanceHidden) ...[
                                Text(
                                  'R\$',
                                  style: TextStyle(
                                    color: colors.textPrimary,
                                    fontSize: 32,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  '••••••',
                                  style: TextStyle(
                                    color: colors.textPrimary,
                                    fontSize: 26,
                                    letterSpacing: 4,
                                  ),
                                ),
                              ] else
                                Text(
                                  CurrencyFormatter.format(state.totalBalance),
                                  style: TextStyle(
                                    color: colors.textPrimary,
                                    fontSize: 32,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Income / Expenses row
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: colors.surface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: colors.border),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: AppColors.income.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(Icons.arrow_downward, color: AppColors.income, size: 14),
                                    ),
                                    const SizedBox(width: 8),
                                    Text('Entradas', style: TextStyle(color: colors.textSecondary, fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  CurrencyFormatter.format(state.monthlyIncome),
                                  style: TextStyle(color: colors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700),
                                ),
                                Text('Este mês', style: TextStyle(color: colors.textMuted, fontSize: 11)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: colors.surface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: colors.border),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: AppColors.expense.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(Icons.arrow_upward, color: AppColors.expense, size: 14),
                                    ),
                                    const SizedBox(width: 8),
                                    Text('Saídas', style: TextStyle(color: colors.textSecondary, fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  CurrencyFormatter.format(state.monthlyExpenses),
                                  style: TextStyle(color: colors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700),
                                ),
                                Text('Este mês', style: TextStyle(color: colors.textMuted, fontSize: 11)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Cards section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Cartões', style: TextStyle(color: colors.textPrimary, fontSize: 18, fontWeight: FontWeight.w700)),
                        TextButton(
                          onPressed: () => context.push('/config/cartoes'),
                          child: const Text('Ver todos >', style: TextStyle(color: AppColors.primary, fontSize: 13)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: state.cards.take(2).toList().asMap().entries.map((entry) {
                        final i = entry.key;
                        final card = entry.value;
                        return Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(left: i == 0 ? 0 : 6, right: i == 0 ? 6 : 0),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: colors.surface,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: card.color.withOpacity(0.35)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.credit_card, color: card.color, size: 16),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          card.name,
                                          style: TextStyle(color: card.color, fontSize: 13, fontWeight: FontWeight.w600),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text('Fatura atual', style: TextStyle(color: colors.textSecondary, fontSize: 11)),
                                  const SizedBox(height: 2),
                                  Text(
                                    CurrencyFormatter.format(card.currentBill),
                                    style: TextStyle(color: colors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Vence em ${card.dueDays} dias',
                                    style: const TextStyle(color: AppColors.primary, fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),

                    // Recent transactions
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Transações recentes', style: TextStyle(color: colors.textPrimary, fontSize: 18, fontWeight: FontWeight.w700)),
                        TextButton(
                          onPressed: () => context.push('/config/transacoes'),
                          child: const Text('Ver todos >', style: TextStyle(color: AppColors.primary, fontSize: 13)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: colors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: colors.border),
                      ),
                      child: Column(
                        children: state.recentTransactions.map((t) {
                          final cat = MockData.categories.firstWhere(
                            (c) => c.id == t.categoryId,
                            orElse: () => MockData.categories.last,
                          );
                          return TransactionItem(transaction: t, category: cat);
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
