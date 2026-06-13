enum SubscriptionPlan { trial, free, pro }

enum SubscriptionStatus { active, expired, canceled }

class Subscription {
  final String id;
  final String userId;
  final SubscriptionPlan plan;
  final SubscriptionStatus status;
  final DateTime? trialEndsAt;
  final DateTime? planExpiresAt;
  final DateTime createdAt;

  const Subscription({
    required this.id,
    required this.userId,
    required this.plan,
    required this.status,
    required this.createdAt,
    this.trialEndsAt,
    this.planExpiresAt,
  });

  /// true se o trial termina em até 3 dias.
  bool get isTrialExpiring {
    if (trialEndsAt == null) return false;
    final remaining = trialEndsAt!.difference(DateTime.now());
    return !remaining.isNegative && remaining.inDays <= 3;
  }

  /// true se a assinatura dá acesso: ACTIVE e (PRO ou TRIAL não-expirado).
  bool get hasActiveAccess {
    if (status != SubscriptionStatus.active) return false;
    if (plan == SubscriptionPlan.pro) return true;
    if (plan == SubscriptionPlan.trial) {
      return trialEndsAt == null || trialEndsAt!.isAfter(DateTime.now());
    }
    return false;
  }

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      id: json['id'] as String,
      userId: json['userId'] as String,
      plan: _planFromString(json['plan'] as String?),
      status: _statusFromString(json['status'] as String?),
      trialEndsAt: _parseDate(json['trialEndsAt']),
      planExpiresAt: _parseDate(json['planExpiresAt']),
      createdAt: _parseDate(json['createdAt']) ?? DateTime.now(),
    );
  }

  static SubscriptionPlan _planFromString(String? value) {
    switch (value) {
      case 'PRO':
        return SubscriptionPlan.pro;
      case 'FREE':
        return SubscriptionPlan.free;
      default:
        return SubscriptionPlan.trial;
    }
  }

  static SubscriptionStatus _statusFromString(String? value) {
    switch (value) {
      case 'EXPIRED':
        return SubscriptionStatus.expired;
      case 'CANCELED':
        return SubscriptionStatus.canceled;
      default:
        return SubscriptionStatus.active;
    }
  }

  static DateTime? _parseDate(dynamic value) {
    if (value is String && value.isNotEmpty) return DateTime.tryParse(value);
    return null;
  }
}
