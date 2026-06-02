import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/providers/providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  void _showHelpSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _HelpSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(settingsViewModelProvider);
    final user = state.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
          children: [
            const Text('Configurações',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),

            // User card
            GestureDetector(
              onTap: () => context.push('/config/perfil'),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          user.initials,
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user.name, style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                          Text(user.email, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios, color: AppColors.textSecondary, size: 16),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            _SectionTitle('CONTA'),
            const SizedBox(height: 8),
            _SettingsGroup(items: [
              _SettingsItem(icon: Icons.person_outline, label: 'Perfil', onTap: () => context.push('/config/perfil')),
              _SettingsItem(icon: Icons.credit_card_outlined, label: 'Cartões', onTap: () => context.push('/config/cartoes')),
              _SettingsItem(icon: Icons.receipt_long_outlined, label: 'Todas as transações', onTap: () => context.push('/config/transacoes')),
              _SettingsItem(icon: Icons.label_outline, label: 'Categorias', onTap: () => context.go('/categorias')),
              _SettingsItem(icon: Icons.notifications_outlined, label: 'Notificações', onTap: () => context.push('/config/notificacoes')),
            ]),
            const SizedBox(height: 20),

            _SectionTitle('PREFERÊNCIAS'),
            const SizedBox(height: 8),
            _SettingsGroup(items: [
              _SettingsItem(icon: Icons.currency_exchange, label: 'Moeda padrão', trailing: const Text('BRL', style: TextStyle(color: AppColors.textSecondary)), onTap: () => context.push('/config/moedas')),
              _SettingsItem(icon: Icons.dark_mode_outlined, label: 'Tema escuro', trailing: Switch(value: true, onChanged: null, activeColor: AppColors.primary), onTap: () {}),
            ]),
            const SizedBox(height: 20),

            _SectionTitle('SEGURANÇA'),
            const SizedBox(height: 8),
            _SettingsGroup(items: [
              _SettingsItem(icon: Icons.lock_outline, label: 'Alterar senha', onTap: () => context.push('/config/alterar-senha')),
              _SettingsItem(icon: Icons.help_outline, label: 'Ajuda e suporte', onTap: () => _showHelpSheet(context)),
            ]),
            const SizedBox(height: 24),

            GestureDetector(
              onTap: () {
                ref.read(authViewModelProvider.notifier).logout();
                context.go('/login');
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.expense.withOpacity(0.3)),
                ),
                child: const Center(
                  child: Text('Sair da conta',
                      style: TextStyle(color: AppColors.expense, fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) => Text(
        title,
        style: const TextStyle(color: AppColors.textMuted, fontSize: 11, letterSpacing: 1),
      );
}

class _SettingsGroup extends StatelessWidget {
  final List<_SettingsItem> items;
  const _SettingsGroup({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: items.asMap().entries.map((e) {
          final isLast = e.key == items.length - 1;
          return Column(
            children: [
              e.value,
              if (!isLast) const Divider(color: AppColors.border, height: 0, indent: 16),
            ],
          );
        }).toList(),
      ),
    );
  }
}

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Widget? trailing;
  final VoidCallback onTap;

  const _SettingsItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textSecondary, size: 20),
      title: Text(label, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14)),
      trailing: trailing ?? const Icon(Icons.arrow_forward_ios, color: AppColors.textMuted, size: 14),
      onTap: onTap,
      dense: true,
    );
  }
}

class _HelpSheet extends StatelessWidget {
  const _HelpSheet();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Ajuda e suporte',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceAlt,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.close,
                      color: AppColors.textSecondary, size: 16),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Items
          Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceAlt,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _HelpItem(
                  icon: Icons.chat_bubble_outline_rounded,
                  title: 'Fale conosco',
                  subtitle: 'Envie uma mensagem para o suporte',
                  onTap: () {},
                ),
                const Divider(color: AppColors.border, height: 0, indent: 56),
                _HelpItem(
                  icon: Icons.help_outline_rounded,
                  title: 'Perguntas frequentes',
                  subtitle: 'Encontre respostas rápidas',
                  onTap: () {},
                ),
                const Divider(color: AppColors.border, height: 0, indent: 56),
                _HelpItem(
                  icon: Icons.description_outlined,
                  title: 'Termos de uso',
                  subtitle: 'Política de privacidade e termos',
                  onTap: () {},
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          const Text(
            'suporte@dinero.app · v1.0.0',
            style: TextStyle(
              color: AppColors.textMuted,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _HelpItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _HelpItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Icon(icon, color: AppColors.textSecondary, size: 20),
      title: Text(title,
          style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w500)),
      subtitle: Text(subtitle,
          style: const TextStyle(
              color: AppColors.textSecondary, fontSize: 12)),
      trailing: const Icon(Icons.open_in_new_rounded,
          color: AppColors.textMuted, size: 16),
    );
  }
}
