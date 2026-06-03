import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/widgets/common/budget_progress_bar.dart';
import 'package:dinero/widgets/common/transaction_item.dart';
import 'package:dinero/widgets/layout/page_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CategoryDetailScreen extends ConsumerWidget {
  final String categoryId;

  const CategoryDetailScreen({super.key, required this.categoryId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vm = ref.read(categoryDetailViewModelProvider.notifier);
    final state = ref.watch(categoryDetailViewModelProvider);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (state.isLoading) vm.load(categoryId);
    });

    if (state.isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    final cat = state.category!;

    return PageShell(
      title: '${cat.emoji} ${cat.name}',
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
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
                Text('Total gasto', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                const SizedBox(height: 4),
                Text(CurrencyFormatter.format(state.totalSpent),
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 28, fontWeight: FontWeight.w700)),
                if (state.budget != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Orçamento: ${CurrencyFormatter.format(state.budget!)}',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                      Text('${(state.percent * 100).toStringAsFixed(0)}%',
                          style: TextStyle(
                              color: state.percent >= 1.0 ? AppColors.danger : state.percent >= 0.8 ? AppColors.warning : cat.color,
                              fontSize: 12,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  BudgetProgressBar(
                    percent: state.percent,
                    color: state.percent >= 1.0 ? AppColors.danger : state.percent >= 0.8 ? AppColors.warning : cat.color,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('Transações', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: state.transactions
                  .map((t) => TransactionItem(transaction: t, category: cat))
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }
}
