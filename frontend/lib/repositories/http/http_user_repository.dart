import 'package:dinero/core/http/api_client.dart';
import 'package:dinero/models/user.dart';
import 'package:dinero/repositories/interfaces/i_user_repository.dart';
import 'package:dio/dio.dart';

class HttpUserRepository implements IUserRepository {
  final ApiClient _client;

  HttpUserRepository(this._client);

  @override
  Future<User> getMe() async {
    try {
      final response = await _client.dio.get('/users/me');
      return User.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }

  @override
  Future<void> updateProfile(String id, Map<String, dynamic> changes) async {
    try {
      await _client.dio.put('/users/$id', data: changes);
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }

  @override
  Future<void> deleteAccount(String id) async {
    try {
      await _client.dio.delete('/users/$id');
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }
}
