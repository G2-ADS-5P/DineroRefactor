import 'package:dinero/core/http/api_client.dart';
import 'package:dinero/core/http/api_exception.dart';
import 'package:dinero/models/auth_result.dart';
import 'package:dinero/models/create_user_data.dart';
import 'package:dinero/models/user.dart';
import 'package:dinero/repositories/interfaces/i_auth_repository.dart';
import 'package:dio/dio.dart';

class HttpAuthRepository implements IAuthRepository {
  final ApiClient _client;

  HttpAuthRepository(this._client);

  @override
  Future<AuthResult> login(String email, String password) async {
    try {
      final response = await _client.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      return _toAuthResult(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw const ApiException('Credenciais inválidas', statusCode: 401);
      }
      throw _client.toApiException(e);
    }
  }

  @override
  Future<AuthResult> register(CreateUserData data) async {
    try {
      final response = await _client.dio.post(
        '/auth/register',
        data: data.toJson(),
      );
      return _toAuthResult(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        throw const ApiException('E-mail já cadastrado', statusCode: 409);
      }
      throw _client.toApiException(e);
    }
  }

  AuthResult _toAuthResult(Map<String, dynamic> json) {
    return AuthResult(
      token: json['accessToken'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
