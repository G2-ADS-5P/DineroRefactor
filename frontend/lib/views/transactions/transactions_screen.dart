import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/providers/providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

class TransactionsScreen extends ConsumerStatefulWidget {
  const TransactionsScreen({super.key});

  @override
  ConsumerState<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends ConsumerState<TransactionsScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  static const _filters = [
    ('todas', 'Todas'),
    ('alimentacao', 'Alimentação'),
    ('moradia', 'Moradia'),
    ('transporte', 'Transporte'),
    ('lazer', 'Lazer'),
  ];

  static IconData _iconFor(Transaction t) {
    if (t.type == TransactionType.income) return Icons.south_west_rounded;
    final desc = t.description.toLowerCase();
    if (desc.contains('luz') || desc.contains('energia') || desc.contains('conta de')) {
      return Icons.bolt_rounded;
    }
    switch (t.categoryId) {
      case 'alimentacao':
        return Icons.shopping_cart_outlined;
      case 'moradia':
        return Icons.home_outlined;
      case 'transporte':
        return Icons.directions_car_outlined;
      case 'lazer':
        return Icons.coffee_outlined;
      case 'assinaturas':
        return Icons.wifi_rounded;
      case 'saude':
        return Icons.favorite_outline;
      case 'educacao':
        return Icons.school_outlined;
      default:
        return Icons.attach_money_rounded;
    }
  }

  Map<String, List<Transaction>> _groupByMonth(List<Transaction> list) {
    final map = <String, List<Transaction>>{};
    for (final t in list) {
      final key = DateFormat("MMM yyyy", 'pt_BR')
          .format(t.date)
          .toUpperCase()
          .replaceAll('.', '');
      map.putIfAbsent(key, () => []).add(t);
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(transactionsViewModelProvider);
    final vm = ref.read(transactionsViewModelProvider.notifier);
    final grouped = _groupByMonth(state.filtered);
    final monthKeys = grouped.keys.toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        titleSpacing: 4,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Transações',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.surfaceAlt,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: const Icon(Icons.tune_rounded, color: AppColors.textSecondary, size: 18),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : Column(
              children: [
                // Search bar
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceAlt,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: vm.setSearch,
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'Buscar transação...',
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
                    itemBuilder: (_, i) {
                      final (id, label) = _filters[i];
                      final isSelected = state.selectedFilter == id;
                      return GestureDetector(
                        onTap: () => vm.setFilter(id),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.transparent : AppColors.surfaceAlt,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Text(
                            label,
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

                const SizedBox(height: 8),

                // Grouped list
                Expanded(
                  child: grouped.isEmpty
                      ? const Center(
                          child: Text(
                            'Nenhuma transação encontrada',
                            style: TextStyle(color: AppColors.textMuted, fontSize: 14),
                          ),
                        )
                      : ListView.builder(
                          itemCount: monthKeys.length,
                          itemBuilder: (_, mi) {
                            final month = monthKeys[mi];
                            final items = grouped[month]!;
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                                  child: Text(
                                    month,
                                    style: const TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: 0.8,
                                    ),
                                  ),
                                ),
                                ...items.map((t) {
                                  final cat = MockData.categories.firstWhere(
                                    (c) => c.id == t.categoryId,
                                    orElse: () => MockData.categories.last,
                                  );
                                  final isIncome = t.type == TransactionType.income;
                                  final amtColor = isIncome ? AppColors.income : AppColors.expense;
                                  final prefix = isIncome ? '+R\$ ' : '-R\$ ';
                                  final dateStr = DateFormat("d MMM", 'pt_BR')
                                      .format(t.date)
                                      .replaceAll('.', '');
                                  // Capitalize month abbreviation
                                  final parts = dateStr.split(' ');
                                  final formattedDate = parts.length == 2
                                      ? '${parts[0]} ${parts[1][0].toUpperCase()}${parts[1].substring(1)}'
                                      : dateStr;

                                  return Container(
                                    decoration: const BoxDecoration(
                                      border: Border(
                                        bottom: BorderSide(color: AppColors.border, width: 0.5),
                                      ),
                                    ),
                                    child: ListTile(
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                                      leading: Container(
                                        width: 42,
                                        height: 42,
                                        decoration: BoxDecoration(
                                          color: AppColors.surfaceAlt,
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Icon(
                                          _iconFor(t),
                                          color: AppColors.textSecondary,
                                          size: 20,
                                        ),
                                      ),
                                      title: Text(
                                        t.description,
                                        style: const TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      subtitle: Text(
                                        '${cat.name} · $formattedDate',
                                        style: const TextStyle(
                                          color: AppColors.textSecondary,
                                          fontSize: 12,
                                        ),
                                      ),
                                      trailing: Text(
                                        '$prefix${CurrencyFormatter.formatValue(t.valueInBrl)}',
                                        style: TextStyle(
                                          color: amtColor,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  );
                                }),
                              ],
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}
