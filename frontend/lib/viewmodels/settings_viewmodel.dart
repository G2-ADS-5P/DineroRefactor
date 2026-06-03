import 'package:dinero/models/user.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SettingsState {
  final User user;
  final String defaultCurrency;
  final bool darkTheme;

  const SettingsState({
    this.user = const User(id: 'u1', name: 'Gabriel Donaduzzi', email: 'gabriel@dinero.app'),
    this.defaultCurrency = 'BRL',
    this.darkTheme = true,
  });

  SettingsState copyWith({
    User? user,
    String? defaultCurrency,
    bool? darkTheme,
  }) =>
      SettingsState(
        user: user ?? this.user,
        defaultCurrency: defaultCurrency ?? this.defaultCurrency,
        darkTheme: darkTheme ?? this.darkTheme,
      );
}

class SettingsViewModel extends StateNotifier<SettingsState> {
  SettingsViewModel() : super(const SettingsState());

  void setDefaultCurrency(String currency) =>
      state = state.copyWith(defaultCurrency: currency);
}
