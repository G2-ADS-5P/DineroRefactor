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
    final state = ref.watch(cardsViewModelProvider);

    return PageShell(
      title: 'Cartões',
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.surfaceAlt,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.border),
            ),
            child: const Icon(Icons.add, color: AppColors.textPrimary, size: 20),
          ),
        ),
      ],
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: state.cards.length,
        separatorBuilder: (_, __) => const SizedBox(height: 14),
        itemBuilder: (_, i) => _CardItem(card: state.cards[i]),
      ),
    );
  }
}

class _CardItem extends StatelessWidget {
  final CardModel card;

  const _CardItem({required this.card});

  String _formatDueDate(int dueDays) {
    // Base: March 17, 2026 → c1(+10)=Mar 27, c2(+15)=Apr 1
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
    final progress = (card.creditLimit != null && card.creditLimit! > 0)
        ? (card.currentBill / card.creditLimit!).clamp(0.0, 1.0)
        : 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            card.color.withOpacity(0.30),
            card.color.withOpacity(0.07),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: card.color.withOpacity(0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row: icon + name | network
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.credit_card, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    card.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              Text(
                card.network,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Card number
          Text(
            '•••• •••• •••• ${card.lastFour}',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              letterSpacing: 2,
            ),
          ),

          const SizedBox(height: 16),

          // Bill + Limit
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    card.isDebit ? 'Saldo' : 'Fatura atual',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    CurrencyFormatter.format(card.currentBill),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              if (card.creditLimit != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('Limite', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    const SizedBox(height: 2),
                    Text(
                      CurrencyFormatter.format(card.creditLimit!),
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
            ],
          ),

          // Progress bar
          if (!card.isDebit && card.creditLimit != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.white.withOpacity(0.12),
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                minHeight: 4,
              ),
            ),
          ],

          // Due date
          if (!card.isDebit) ...[
            const SizedBox(height: 12),
            Text(
              'Vencimento: ${_formatDueDate(card.dueDays)}',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}
