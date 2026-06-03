import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;

  const AuthState({this.isAuthenticated = false, this.isLoading = false});

  AuthState copyWith({bool? isAuthenticated, bool? isLoading}) => AuthState(
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        isLoading: isLoading ?? this.isLoading,
      );
}

class AuthViewModel extends StateNotifier<AuthState> {
  AuthViewModel() : super(const AuthState());

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 500));
    state = state.copyWith(isAuthenticated: true, isLoading: false);
  }

  void logout() => state = const AuthState();
}
