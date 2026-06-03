import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/providers/providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _biometrico = true;
  bool _ocultarSaldos = false;
  bool _compartilhamento = false;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(settingsViewModelProvider).user;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              color: AppColors.textPrimary, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Perfil',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text(
              'Editar',
              style: TextStyle(
                color: AppColors.primary,
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          // Avatar
          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.18),
                shape: BoxShape.circle,
                border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.35), width: 2),
              ),
              child: Center(
                child: Text(
                  user.initials,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Info fields
          _InfoField(
            icon: Icons.mail_outline_rounded,
            label: 'NOME',
            value: user.name,
          ),
          const SizedBox(height: 10),
          _InfoField(
            icon: Icons.mail_outline_rounded,
            label: 'E-MAIL',
            value: user.email,
            trailing: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Verificado',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          const _InfoField(
            icon: Icons.phone_outlined,
            label: 'TELEFONE',
            value: '+55 11 99999-0000',
          ),
          const SizedBox(height: 10),
          const _InfoField(
            icon: Icons.calendar_today_outlined,
            label: 'DATA DE NASCIMENTO',
            value: '15/03/1995',
          ),
          const SizedBox(height: 10),
          const _InfoField(
            icon: Icons.location_on_outlined,
            label: 'LOCALIZAÇÃO',
            value: 'São Paulo, SP',
          ),

          const SizedBox(height: 28),

          // Privacy section
          Row(
            children: const [
              Icon(Icons.shield_outlined,
                  color: AppColors.textMuted, size: 14),
              SizedBox(width: 6),
              Text(
                'PRIVACIDADE',
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 11,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _PrivacyToggle(
                  title: 'Bloqueio biométrico',
                  subtitle: 'Exigir biometria ao abrir o app',
                  subtitleColor: AppColors.textSecondary,
                  value: _biometrico,
                  onChanged: (v) => setState(() => _biometrico = v),
                ),
                const Divider(color: AppColors.border, height: 0, indent: 16),
                _PrivacyToggle(
                  title: 'Ocultar saldos',
                  subtitle: 'Esconder valores na tela inicial',
                  subtitleColor: AppColors.warning,
                  value: _ocultarSaldos,
                  onChanged: (v) => setState(() => _ocultarSaldos = v),
                ),
                const Divider(color: AppColors.border, height: 0, indent: 16),
                _PrivacyToggle(
                  title: 'Compartilhamento de dados',
                  subtitle: 'Permitir análises anônimas de uso',
                  subtitleColor: AppColors.textSecondary,
                  value: _compartilhamento,
                  onChanged: (v) => setState(() => _compartilhamento = v),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoField extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Widget? trailing;

  const _InfoField({
    required this.icon,
    required this.label,
    required this.value,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.textMuted, size: 18),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 10,
                    letterSpacing: 0.8,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

class _PrivacyToggle extends StatelessWidget {
  final String title;
  final String subtitle;
  final Color subtitleColor;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _PrivacyToggle({
    required this.title,
    required this.subtitle,
    required this.subtitleColor,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: subtitleColor,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppColors.primary,
            activeTrackColor: AppColors.primary.withValues(alpha: 0.35),
            inactiveThumbColor: AppColors.textMuted,
            inactiveTrackColor: AppColors.surfaceAlt,
          ),
        ],
      ),
    );
  }
}
