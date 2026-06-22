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

  void _showAddDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (_) => _AddCardDialog(
        onAdd: ({
          required name,
          required brand,
          required lastDigits,
          required creditLimit,
          required dueDay,
        }) =>
            ref.read(cardsViewModelProvider.notifier).addCard(
                  name: name,
                  brand: brand,
                  lastDigits: lastDigits,
                  creditLimit: creditLimit,
                  dueDay: dueDay,
                ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(cardsViewModelProvider);

    return PageShell(
      title: 'Cartões',
      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: GestureDetector(
            onTap: () => _showAddDialog(context, ref),
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
        ),
      ],
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : state.cards.isEmpty
              ? const Center(
                  child: Text('Nenhum cartão cadastrado',
                      style: TextStyle(color: AppColors.textSecondary)),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: state.cards.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (_, i) => _CardItem(card: state.cards[i]),
                ),
    );
  }
}

class _AddCardDialog extends StatefulWidget {
  final Future<void> Function({
    required String name,
    required String brand,
    required String lastDigits,
    required double creditLimit,
    required int dueDay,
  }) onAdd;

  const _AddCardDialog({required this.onAdd});

  @override
  State<_AddCardDialog> createState() => _AddCardDialogState();
}

class _AddCardDialogState extends State<_AddCardDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _lastDigitsController = TextEditingController();
  final _limitController = TextEditingController();
  final _dueDayController = TextEditingController();
  String _brand = 'MASTERCARD';
  bool _loading = false;

  static const _brands = ['MASTERCARD', 'VISA', 'ELO'];

  @override
  void dispose() {
    _nameController.dispose();
    _lastDigitsController.dispose();
    _limitController.dispose();
    _dueDayController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await widget.onAdd(
        name: _nameController.text.trim(),
        brand: _brand,
        lastDigits: _lastDigitsController.text.trim(),
        creditLimit: double.parse(_limitController.text.replaceAll(',', '.')),
        dueDay: int.parse(_dueDayController.text.trim()),
      );
      if (mounted) Navigator.of(context).pop();
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  InputDecoration _dec(String label) => InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: AppColors.textSecondary),
        filled: true,
        fillColor: AppColors.surfaceAlt,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
      );

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('Novo cartão', style: TextStyle(color: AppColors.textPrimary)),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nameController,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: _dec('Nome do cartão'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Obrigatório' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _brand,
                dropdownColor: AppColors.surfaceAlt,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: _dec('Bandeira'),
                items: _brands
                    .map((b) => DropdownMenuItem(value: b, child: Text(b)))
                    .toList(),
                onChanged: (v) => setState(() => _brand = v!),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _lastDigitsController,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: _dec('Últimos 4 dígitos'),
                keyboardType: TextInputType.number,
                maxLength: 4,
                validator: (v) {
                  if (v == null || v.length != 4) return '4 dígitos';
                  if (!RegExp(r'^\d{4}$').hasMatch(v)) return 'Apenas números';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _limitController,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: _dec('Limite de crédito (R\$)'),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Obrigatório';
                  final n = double.tryParse(v.replaceAll(',', '.'));
                  if (n == null || n <= 0) return 'Valor inválido';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _dueDayController,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: _dec('Dia de vencimento (1-31)'),
                keyboardType: TextInputType.number,
                validator: (v) {
                  final n = int.tryParse(v ?? '');
                  if (n == null || n < 1 || n > 31) return 'Entre 1 e 31';
                  return null;
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar', style: TextStyle(color: AppColors.textSecondary)),
        ),
        ElevatedButton(
          onPressed: _loading ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: _loading
              ? const SizedBox(
                  width: 18, height: 18,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                )
              : const Text('Salvar'),
        ),
      ],
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
