import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/models/transaction.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/viewmodels/add_transaction_viewmodel.dart';
import 'package:dinero/widgets/common/category_chip.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AddTransactionScreen extends ConsumerWidget {
  const AddTransactionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(addTransactionViewModelProvider);
    final vm = ref.read(addTransactionViewModelProvider.notifier);
    final isExpense = state.type == TransactionType.expense;
    final accentColor = isExpense ? AppColors.expense : AppColors.income;

    ref.listen(addTransactionViewModelProvider, (_, next) {
      if (next.status == AddTransactionStatus.success) {
        ref.read(dashboardViewModelProvider.notifier).refresh();
        context.pop();
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 18),
          onPressed: () => context.pop(),
        ),
        title: const Text('Nova transação',
            style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w700)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Type toggle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceAlt,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => vm.setType(TransactionType.expense),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: isExpense ? AppColors.expense : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Despesa',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: isExpense ? Colors.white : AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => vm.setType(TransactionType.income),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: !isExpense ? AppColors.income : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Receita',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: !isExpense ? Colors.white : AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Value display
            Text(
              'R\$ ${state.displayValue}',
              style: TextStyle(
                color: accentColor,
                fontSize: 40,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 16),

            // Category chips
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: MockData.categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final cat = MockData.categories[i];
                  return CategoryChip(
                    category: cat,
                    isSelected: state.selectedCategoryId == cat.id,
                    onTap: () => vm.selectCategory(cat.id),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),

            // Description field
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                style: const TextStyle(color: AppColors.textPrimary),
                onChanged: vm.setDescription,
                decoration: const InputDecoration(
                  hintText: 'Ex: Supermercado, restaurante...',
                  prefixIcon: Icon(Icons.edit_outlined, color: AppColors.textSecondary, size: 18),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Keypad
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GridView.count(
                  crossAxisCount: 3,
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  childAspectRatio: 1.8,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
                      (d) => _KeypadButton(
                        label: d,
                        onTap: () => vm.appendDigit(d),
                      ),
                    ),
                    _KeypadButton(label: ',', onTap: vm.appendDecimal),
                    _KeypadButton(label: '0', onTap: () => vm.appendDigit('0')),
                    _KeypadButton(
                      icon: Icons.backspace_outlined,
                      onTap: vm.backspace,
                    ),
                  ],
                ),
              ),
            ),

            // Submit button
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: state.status == AddTransactionStatus.loading
                      ? null
                      : vm.submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accentColor,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: state.status == AddTransactionStatus.loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          isExpense ? 'Registrar despesa' : 'Registrar receita',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _KeypadButton extends StatelessWidget {
  final String? label;
  final IconData? icon;
  final VoidCallback onTap;

  const _KeypadButton({this.label, this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceAlt,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: icon != null
              ? Icon(icon, color: AppColors.textPrimary, size: 20)
              : Text(
                  label!,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
        ),
      ),
    );
  }
}
