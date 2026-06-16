import 'package:dinero/core/config/app_config.dart';
import 'package:dinero/core/network/api_client.dart';
import 'package:dinero/core/network/token_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? errorMessage;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? errorMessage,
  }) =>
      AuthState(
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        isLoading: isLoading ?? this.isLoading,
        errorMessage: errorMessage,
      );
}

class AuthViewModel extends StateNotifier<AuthState> {
  AuthViewModel(this._client, this._tokenStorage) : super(const AuthState());

  final ApiClient _client;
  final TokenStorage _tokenStorage;

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final raw = await _client.post(
        BackendService.identity,
        '/auth/login',
        body: {'email': email, 'password': password},
      );
      final token = (raw as Map<String, dynamic>)['accessToken'] as String;
      _tokenStorage.save(token);
      state = state.copyWith(isAuthenticated: true, isLoading: false);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Erro ao conectar ao servidor.',
      );
    }
  }

  void logout() {
    _tokenStorage.clear();
    state = const AuthState();
  }
}
