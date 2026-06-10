import 'package:dinero/core/theme/app_colors.dart';
import 'package:dinero/models/subscription.dart';
import 'package:dinero/providers/providers.dart';
import 'package:dinero/viewmodels/subscription_viewmodel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SubscriptionScreen extends ConsumerWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(subscriptionViewModelProvider);
    final vm = ref.read(subscriptionViewModelProvider.notifier);
    final sub = state.subscription;

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
          'Plano / Assinatura',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: false,
      ),
      body: _buildBody(context, state, sub, vm),
    );
  }

  Widget _buildBody(
    BuildContext context,
    SubscriptionState state,
    Subscription? sub,
    SubscriptionViewModel vm,
  ) {
    if (state.isLoading && sub == null) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (sub == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            state.error ?? 'Não foi possível carregar a assinatura',
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.danger),
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      children: [
        Center(child: _PlanBadge(plan: sub.plan)),
        const SizedBox(height: 20),
        _StatusRow(status: sub.status),
        const SizedBox(height: 16),
        if (sub.plan == SubscriptionPlan.trial && sub.trialEndsAt != null)
          _TrialInfo(subscription: sub),
        if (sub.planExpiresAt != null && sub.plan == SubscriptionPlan.pro) ...[
          const SizedBox(height: 8),
          _InfoLine(
            label: 'Plano PRO válido até',
            value: _formatDate(sub.planExpiresAt!),
          ),
        ],
        const SizedBox(height: 28),
        if (state.error != null) ...[
          Text(
            state.error!,
            style: const TextStyle(color: AppColors.danger, fontSize: 14),
          ),
          const SizedBox(height: 12),
        ],
        if (sub.plan != SubscriptionPlan.pro)
          _PrimaryButton(
            label: 'Ativar PRO',
            isLoading: state.isLoading,
            onPressed: () => vm.activate(),
          ),
        if (sub.plan == SubscriptionPlan.pro &&
            sub.status == SubscriptionStatus.active) ...[
          _PrimaryButton(
            label: 'Cancelar plano',
            isLoading: state.isLoading,
            danger: true,
            onPressed: () => vm.cancel(),
          ),
        ],
      ],
    );
  }

  static String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/'
      '${d.month.toString().padLeft(2, '0')}/${d.year}';
}

class _PlanBadge extends StatelessWidget {
  final SubscriptionPlan plan;
  const _PlanBadge({required this.plan});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (plan) {
      SubscriptionPlan.pro => ('PRO', AppColors.primary),
      SubscriptionPlan.trial => ('TRIAL', AppColors.warning),
      SubscriptionPlan.free => ('FREE', AppColors.textMuted),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 28,
          fontWeight: FontWeight.w800,
          letterSpacing: 2,
        ),
      ),
    );
  }
}

class _StatusRow extends StatelessWidget {
  final SubscriptionStatus status;
  const _StatusRow({required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      SubscriptionStatus.active => ('Ativa', AppColors.primary),
      SubscriptionStatus.expired => ('Expirada', AppColors.danger),
      SubscriptionStatus.canceled => ('Cancelada', AppColors.textMuted),
    };
    return Center(
      child: Text(
        'Situação: $label',
        style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _TrialInfo extends StatelessWidget {
  final Subscription subscription;
  const _TrialInfo({required this.subscription});

  @override
  Widget build(BuildContext context) {
    final remaining =
        subscription.trialEndsAt!.difference(DateTime.now()).inDays;
    final expiring = subscription.isTrialExpiring;
    final days = remaining < 0 ? 0 : remaining;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: (expiring ? AppColors.warning : AppColors.surface)
            .withValues(alpha: expiring ? 0.15 : 1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: expiring ? AppColors.warning : AppColors.border,
        ),
      ),
      child: Row(
        children: [
          Icon(
            expiring ? Icons.warning_amber_rounded : Icons.schedule,
            color: expiring ? AppColors.warning : AppColors.textSecondary,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              days > 0
                  ? 'Seu trial termina em $days ${days == 1 ? 'dia' : 'dias'}'
                  : 'Seu trial terminou',
              style: TextStyle(
                color: expiring ? AppColors.warning : AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  final String label;
  final String value;
  const _InfoLine({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
        Text(value,
            style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  final String label;
  final bool isLoading;
  final bool danger;
  final VoidCallback onPressed;

  const _PrimaryButton({
    required this.label,
    required this.isLoading,
    required this.onPressed,
    this.danger = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: danger ? AppColors.surface : AppColors.primary,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: danger
                ? const BorderSide(color: AppColors.danger)
                : BorderSide.none,
          ),
        ),
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                    color: Colors.white, strokeWidth: 2),
              )
            : Text(
                label,
                style: TextStyle(
                  color: danger ? AppColors.danger : Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }
}
