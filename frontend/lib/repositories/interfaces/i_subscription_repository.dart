import 'package:dinero/models/subscription.dart';

abstract class ISubscriptionRepository {
  /// GET /subscriptions/me
  Future<Subscription> getMine();

  /// POST /subscriptions/me/activate
  Future<Subscription> activate({int? durationDays});

  /// POST /subscriptions/me/cancel
  Future<Subscription> cancel();
}
