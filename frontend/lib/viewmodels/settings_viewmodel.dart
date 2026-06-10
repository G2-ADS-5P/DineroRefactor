import 'package:dinero/core/http/api_exception.dart';
import 'package:dinero/models/user.dart';
import 'package:dinero/repositories/interfaces/i_preference_repository.dart';
import 'package:dinero/repositories/interfaces/i_user_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsState {
  final User? user;
  final String defaultCurrency;
  final bool darkTheme;
  final bool isLoading;
  final String? errorMessage;

  const SettingsState({
    this.user,
    this.defaultCurrency = 'BRL',
    this.darkTheme = true,
    this.isLoading = true,
    this.errorMessage,
  });

  SettingsState copyWith({
    User? user,
    String? defaultCurrency,
    bool? darkTheme,
    bool? isLoading,
    String? errorMessage,
  }) =>
      SettingsState(
        user: user ?? this.user,
        defaultCurrency: defaultCurrency ?? this.defaultCurrency,
        darkTheme: darkTheme ?? this.darkTheme,
        isLoading: isLoading ?? this.isLoading,
        errorMessage: errorMessage,
      );
}

class SettingsViewModel extends StateNotifier<SettingsState> {
  final IUserRepository _userRepository;
  final IPreferenceRepository _preferenceRepository;

  SettingsViewModel(this._userRepository, this._preferenceRepository)
      : super(const SettingsState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final user = await _userRepository.getMe();
      final currency = await _preferenceRepository.getDefaultCurrency();
      state = state.copyWith(
        user: user,
        defaultCurrency: currency,
        isLoading: false,
      );
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    }
  }

  Future<void> setDefaultCurrency(String currency) async {
    try {
      await _preferenceRepository.updateCurrency(currency);
      state = state.copyWith(defaultCurrency: currency);
    } on ApiException catch (e) {
      state = state.copyWith(errorMessage: e.message);
    }
  }
}
