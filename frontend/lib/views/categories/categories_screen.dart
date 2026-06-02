import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/core/utils/currency_formatter.dart';
import 'package:dinero/models/category.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/widgets/charts/donut_chart_widget.dart';
import 'package:dinero/widgets/common/budget_progress_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class CategoriesScreen extends ConsumerStatefulWidget {
  const CategoriesScreen({super.key});

  @override
  ConsumerState<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends ConsumerState<CategoriesScreen> {
  int _chartKey = 0;
  GoRouter? _router;
  bool _lastWasCategories = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_router == null) {
      _router = GoRouter.of(context);
      final path = _router!.routeInformationProvider.value.uri.path;
      _lastWasCategories = path == '/categorias';
      _router!.routerDelegate.addListener(_onRouteChange);
    }
  }

  @override
  void dispose() {
    _router?.routerDelegate.removeListener(_onRouteChange);
    super.dispose();
  }

  void _onRouteChange() {
    if (!mounted) return;
    final path = _router!.routeInformationProvider.value.uri.path;
    final isCategories = path == '/categorias';
    if (isCategories && !_lastWasCategories) {
      setState(() => _chartKey++);
    }
    _lastWasCategories = isCategories;
  }

  void _showAddCategoryModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _NewCategorySheet(
        onSave: (category) {
          ref.read(categoriesViewModelProvider.notifier).addCategory(category);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(categoriesViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: state.isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Categorias',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      GestureDetector(
                        onTap: _showAddCategoryModal,
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.add, color: Colors.white, size: 20),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  DonutChartWidget(
                    key: ValueKey(_chartKey),
                    stats: state.stats,
                    totalSpent: state.totalSpent,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Março 2026',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...state.stats.map((s) => GestureDetector(
                        onTap: () => context.push('/categorias/${s.category.id}'),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Row 1: emoji + name + arrow
                              Row(
                                children: [
                                  Text(
                                    s.category.emoji,
                                    style: const TextStyle(fontSize: 20),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      s.category.name,
                                      style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                  const Icon(
                                    Icons.chevron_right,
                                    color: AppColors.textMuted,
                                    size: 18,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              // Row 2: budget text + percent
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    s.budget != null
                                        ? '${CurrencyFormatter.format(s.spent)} / ${CurrencyFormatter.format(s.budget!)}'
                                        : CurrencyFormatter.format(s.spent),
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 12,
                                    ),
                                  ),
                                  if (s.budget != null)
                                    Text(
                                      '${(s.percent * 100).toStringAsFixed(0)}%',
                                      style: TextStyle(
                                        color: s.percent >= 1.0
                                            ? AppColors.danger
                                            : s.percent >= 0.8
                                                ? AppColors.warning
                                                : s.category.color,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                ],
                              ),
                              if (s.budget != null) ...[
                                const SizedBox(height: 8),
                                BudgetProgressBar(
                                  percent: s.percent,
                                  color: s.percent >= 1.0
                                      ? AppColors.danger
                                      : s.percent >= 0.8
                                          ? AppColors.warning
                                          : s.category.color,
                                ),
                              ],
                            ],
                          ),
                        ),
                      )),
                ],
              ),
      ),
    );
  }
}

class _NewCategorySheet extends StatefulWidget {
  final void Function(Category category) onSave;

  const _NewCategorySheet({required this.onSave});

  @override
  State<_NewCategorySheet> createState() => _NewCategorySheetState();
}

class _NewCategorySheetState extends State<_NewCategorySheet> {
  final _nameController = TextEditingController();
  final _budgetController = TextEditingController();

  String _selectedEmoji = '🎯';
  Color _selectedColor = const Color(0xFF3B82F6);

  static const _emojis = [
    '🎯', '🎨', '🐕', '✈️', '🎁', '💼', '🏋️', '🛒',
    '☕', '🎵', '📷', '🎸', '😊', '🎉', '🔧', '🕺',
    '🚀', '💡', '🌱', '🍷', '🎮', '📦', '💳', '🏠',
  ];

  static const _colors = [
    Color(0xFF3B82F6),
    Color(0xFFF97316),
    Color(0xFF22C55E),
    Color(0xFFA855F7),
    Color(0xFF06B6D4),
    Color(0xFFEF4444),
    Color(0xFFF59E0B),
    Color(0xFFEC4899),
    Color(0xFF14B8A6),
    Color(0xFF7C3AED),
    Color(0xFFEA580C),
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _budgetController.dispose();
    super.dispose();
  }

  double? get _parsedBudget {
    final text =
        _budgetController.text.trim().replaceAll('.', '').replaceAll(',', '.');
    return double.tryParse(text);
  }

  void _submit() {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;

    final category = Category(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      emoji: _selectedEmoji,
      color: _selectedColor,
      isDefault: false,
      budgetAmount: _parsedBudget,
    );

    widget.onSave(category);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final previewName =
        _nameController.text.isEmpty ? 'Nome da categoria' : _nameController.text;
    final budgetVal = _parsedBudget;
    final budgetText = budgetVal != null && budgetVal > 0
        ? 'Orçamento: ${CurrencyFormatter.format(budgetVal)}'
        : 'Orçamento: R\$ 0,00';

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.87,
        decoration: const BoxDecoration(
          color: Color(0xFF1A1A1A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Drag handle
            Container(
              margin: const EdgeInsets.only(top: 10),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title + close
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Nova categoria',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => Navigator.of(context).pop(),
                          child: const Icon(
                            Icons.close,
                            color: AppColors.textSecondary,
                            size: 22,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Personalize o ícone, nome, cor e orçamento.',
                      style:
                          TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 16),
                    // Preview card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: _selectedColor.withValues(alpha: 0.2),
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: _selectedColor, width: 1.5),
                            ),
                            child: Center(
                              child: Text(
                                _selectedEmoji,
                                style: const TextStyle(fontSize: 22),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                previewName,
                                style: const TextStyle(
                                  color: AppColors.textPrimary,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                budgetText,
                                style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Name field
                    const Text(
                      'Nome',
                      style:
                          TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _nameController,
                      onChanged: (_) => setState(() {}),
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'Ex: Viagens, Pet, Freelance...',
                        hintStyle: const TextStyle(color: AppColors.textMuted),
                        filled: true,
                        fillColor: AppColors.surfaceInput,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                              color: AppColors.primary, width: 1.5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Icon grid
                    const Text(
                      'Ícone',
                      style:
                          TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _emojis.map((emoji) {
                        final isSelected = emoji == _selectedEmoji;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedEmoji = emoji),
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? _selectedColor.withValues(alpha: 0.2)
                                  : AppColors.surfaceAlt,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isSelected
                                    ? _selectedColor
                                    : Colors.transparent,
                                width: 1.5,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                emoji,
                                style: const TextStyle(fontSize: 22),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                    // Color picker
                    const Text(
                      'Cor da tag',
                      style:
                          TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: _colors.map((color) {
                        final isSelected = color == _selectedColor;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedColor = color),
                          child: Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                              border: isSelected
                                  ? Border.all(color: Colors.white, width: 2.5)
                                  : null,
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: color.withValues(alpha: 0.5),
                                        blurRadius: 6,
                                        spreadRadius: 1,
                                      )
                                    ]
                                  : null,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                    // Budget field
                    const Text(
                      'Orçamento mensal',
                      style:
                          TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _budgetController,
                      onChanged: (_) => setState(() {}),
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        prefixText: 'R\$  ',
                        prefixStyle:
                            const TextStyle(color: AppColors.textSecondary),
                        hintText: '0,00',
                        hintStyle: const TextStyle(color: AppColors.textMuted),
                        filled: true,
                        fillColor: AppColors.surfaceInput,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(
                              color: AppColors.primary, width: 1.5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    // Submit button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: const Text(
                          'Criar categoria',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
