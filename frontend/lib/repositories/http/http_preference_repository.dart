import 'package:dinero/core/http/api_client.dart';
import 'package:dinero/repositories/interfaces/i_preference_repository.dart';
import 'package:dio/dio.dart';

class HttpPreferenceRepository implements IPreferenceRepository {
  final ApiClient _client;

  HttpPreferenceRepository(this._client);

  @override
  Future<String> getDefaultCurrency() async {
    try {
      final response = await _client.dio.get('/preferences/me');
      final data = response.data as Map<String, dynamic>;
      return data['defaultCurrency'] as String;
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }

  @override
  Future<void> updateCurrency(String currency) async {
    try {
      await _client.dio.put('/preferences/currency', data: {'currency': currency});
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }
}
