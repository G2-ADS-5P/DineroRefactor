import 'package:dinero/core/http/api_exception.dart';
import 'package:dinero/core/storage/token_storage.dart';
import 'package:dinero/models/create_user_data.dart';
import 'package:dinero/repositories/interfaces/i_auth_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

const Object _unset = Object();

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
    Object? errorMessage = _unset,
  }) =>
      AuthState(
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        isLoading: isLoading ?? this.isLoading,
        errorMessage: identical(errorMessage, _unset)
            ? this.errorMessage
            : errorMessage as String?,
      );
}

class AuthViewModel extends StateNotifier<AuthState> {
  final IAuthRepository _authRepository;
  final TokenStorage _tokenStorage;

  AuthViewModel(this._authRepository, this._tokenStorage)
      : super(const AuthState()) {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final token = await _tokenStorage.getToken();
    if (token != null && token.isNotEmpty) {
      state = state.copyWith(isAuthenticated: true);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _authRepository.login(email, password);
      await _tokenStorage.saveToken(result.token);
      state = state.copyWith(isAuthenticated: true, isLoading: false);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    }
  }

  Future<void> register(CreateUserData data) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _authRepository.register(data);
      await _tokenStorage.saveToken(result.token);
      state = state.copyWith(isAuthenticated: true, isLoading: false);
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
    }
  }

  Future<void> logout() async {
    await _tokenStorage.clear();
    state = const AuthState();
  }
}
