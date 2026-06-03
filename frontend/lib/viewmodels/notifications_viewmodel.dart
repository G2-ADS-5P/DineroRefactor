import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum NotificationType {
  budgetWarning,
  assetUp,
  cardDue,
  dividend,
  assetDown,
  budgetExceeded,
}

extension NotificationTypeStyle on NotificationType {
  IconData get icon {
    switch (this) {
      case NotificationType.budgetWarning:
        return Icons.warning_amber_rounded;
      case NotificationType.assetUp:
        return Icons.trending_up_rounded;
      case NotificationType.cardDue:
        return Icons.credit_card_outlined;
      case NotificationType.dividend:
        return Icons.attach_money_rounded;
      case NotificationType.assetDown:
        return Icons.trending_down_rounded;
      case NotificationType.budgetExceeded:
        return Icons.percent_rounded;
    }
  }

  Color get color {
    switch (this) {
      case NotificationType.budgetWarning:
        return const Color(0xFFF59E0B);
      case NotificationType.assetUp:
        return const Color(0xFF22C55E);
      case NotificationType.cardDue:
        return const Color(0xFF3B82F6);
      case NotificationType.dividend:
        return const Color(0xFF06B6D4);
      case NotificationType.assetDown:
        return const Color(0xFFEF4444);
      case NotificationType.budgetExceeded:
        return const Color(0xFFF59E0B);
    }
  }
}

class AppNotification {
  final String id;
  final String title;
  final String body;
  final DateTime date;
  final String timeAgo;
  final bool isRead;
  final NotificationType type;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.date,
    required this.timeAgo,
    required this.type,
    this.isRead = false,
  });

  AppNotification copyWith({bool? isRead}) => AppNotification(
        id: id,
        title: title,
        body: body,
        date: date,
        timeAgo: timeAgo,
        type: type,
        isRead: isRead ?? this.isRead,
      );
}

class NotificationsState {
  final List<AppNotification> notifications;

  const NotificationsState({this.notifications = const []});

  int get unreadCount => notifications.where((n) => !n.isRead).length;

  NotificationsState copyWith({List<AppNotification>? notifications}) =>
      NotificationsState(notifications: notifications ?? this.notifications);
}

class NotificationsViewModel extends StateNotifier<NotificationsState> {
  NotificationsViewModel()
      : super(NotificationsState(notifications: [
          AppNotification(
            id: 'n1',
            title: 'Limite de Alimentação próximo',
            body: 'Você já usou 92% do orçamento de Alimentação este mês (R\$ 1.380 de R\$ 1.500).',
            date: DateTime(2026, 3, 31),
            timeAgo: 'Agora',
            type: NotificationType.budgetWarning,
            isRead: false,
          ),
          AppNotification(
            id: 'n2',
            title: 'MXRF11 subiu +3,2%',
            body: 'O fundo MXRF11 valorizou 3,2% hoje, cotação atual R\$ 10,45.',
            date: DateTime(2026, 3, 31),
            timeAgo: '2h atrás',
            type: NotificationType.assetUp,
            isRead: false,
          ),
          AppNotification(
            id: 'n3',
            title: 'Fatura Nubank vence em 3 dias',
            body: 'Sua fatura de R\$ 1.234,56 vence em 18/03. Não esqueça de pagar!',
            date: DateTime(2026, 3, 31),
            timeAgo: '5h atrás',
            type: NotificationType.cardDue,
            isRead: false,
          ),
          AppNotification(
            id: 'n4',
            title: 'Dividendo recebido — PETR4',
            body: 'Você recebeu R\$ 48,30 em dividendos de PETR4 (15 cotas).',
            date: DateTime(2026, 3, 30),
            timeAgo: 'Ontem',
            type: NotificationType.dividend,
            isRead: true,
          ),
          AppNotification(
            id: 'n5',
            title: 'IVVB11 caiu -2,1%',
            body: 'O ETF IVVB11 desvalorizou 2,1% hoje, cotação atual R\$ 284,50.',
            date: DateTime(2026, 3, 30),
            timeAgo: 'Ontem',
            type: NotificationType.assetDown,
            isRead: true,
          ),
          AppNotification(
            id: 'n6',
            title: 'Orçamento de Lazer estourado',
            body: 'Você ultrapassou o limite de R\$ 500 para Lazer. Total gasto: R\$ 567,80.',
            date: DateTime(2026, 3, 29),
            timeAgo: '2 dias atrás',
            type: NotificationType.budgetExceeded,
            isRead: true,
          ),
        ]));

  void markAsRead(String id) {
    state = state.copyWith(
      notifications: state.notifications
          .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
          .toList(),
    );
  }
}
