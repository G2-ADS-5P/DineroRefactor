import 'package:dinero/core/http/api_client.dart';
import 'package:dinero/models/subscription.dart';
import 'package:dinero/repositories/interfaces/i_subscription_repository.dart';
import 'package:dio/dio.dart';

class HttpSubscriptionRepository implements ISubscriptionRepository {
  final ApiClient _client;

  HttpSubscriptionRepository(this._client);

  @override
  Future<Subscription> getMine() async {
    try {
      final response = await _client.dio.get('/subscriptions/me');
      return Subscription.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }

  @override
  Future<Subscription> activate({int? durationDays}) async {
    try {
      final response = await _client.dio.post(
        '/subscriptions/me/activate',
        data: durationDays != null ? {'durationDays': durationDays} : {},
      );
      return Subscription.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }

  @override
  Future<Subscription> cancel() async {
    try {
      final response = await _client.dio.post('/subscriptions/me/cancel');
      return Subscription.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }
}
