import 'package:dinero/core/http/api_exception.dart';
import 'package:dinero/models/subscription.dart';
import 'package:dinero/repositories/interfaces/i_subscription_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SubscriptionState {
  final Subscription? subscription;
  final bool isLoading;
  final String? error;

  const SubscriptionState({
    this.subscription,
    this.isLoading = true,
    this.error,
  });

  SubscriptionState copyWith({
    Subscription? subscription,
    bool? isLoading,
    String? error,
  }) =>
      SubscriptionState(
        subscription: subscription ?? this.subscription,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

class SubscriptionViewModel extends StateNotifier<SubscriptionState> {
  final ISubscriptionRepository _repository;

  SubscriptionViewModel(this._repository) : super(const SubscriptionState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final sub = await _repository.getMine();
      state = state.copyWith(subscription: sub, isLoading: false);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
    }
  }

  Future<void> activate({int? durationDays}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final sub = await _repository.activate(durationDays: durationDays);
      state = state.copyWith(subscription: sub, isLoading: false);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
    }
  }

  Future<void> cancel() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final sub = await _repository.cancel();
      state = state.copyWith(subscription: sub, isLoading: false);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
    }
  }
}
