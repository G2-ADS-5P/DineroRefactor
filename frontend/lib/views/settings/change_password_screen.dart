import 'package:dinero/core/theme/app_colors.dart';
import 'package:flutter/material.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  bool _showCurrent = false;
  bool _showNew = false;
  bool _showConfirm = false;

  @override
  Widget build(BuildContext context) {
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
          'Alterar senha',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: false,
      ),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Lock icon
            Center(
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(
                  Icons.lock_outline_rounded,
                  color: AppColors.primary,
                  size: 32,
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Senha atual
            _PasswordField(
              label: 'Senha atual',
              obscure: !_showCurrent,
              onToggle: () => setState(() => _showCurrent = !_showCurrent),
            ),

            const SizedBox(height: 16),

            // Nova senha
            _PasswordField(
              label: 'Nova senha',
              obscure: !_showNew,
              onToggle: () => setState(() => _showNew = !_showNew),
            ),

            const SizedBox(height: 16),

            // Confirmar nova senha
            _PasswordField(
              label: 'Confirmar nova senha',
              obscure: !_showConfirm,
              onToggle: () => setState(() => _showConfirm = !_showConfirm),
            ),

            const SizedBox(height: 28),

            // Salvar button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Senha alterada com sucesso'),
                      backgroundColor: AppColors.primary,
                    ),
                  );
                  Navigator.of(context).pop();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Salvar nova senha',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PasswordField extends StatelessWidget {
  final String label;
  final bool obscure;
  final VoidCallback onToggle;

  const _PasswordField({
    required this.label,
    required this.obscure,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: AppColors.surfaceInput,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: TextField(
            obscureText: obscure,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 15,
              letterSpacing: 2,
            ),
            decoration: InputDecoration(
              border: InputBorder.none,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              suffixIcon: IconButton(
                icon: Icon(
                  obscure
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  color: AppColors.textMuted,
                  size: 20,
                ),
                onPressed: onToggle,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
