import 'package:dinero/core/config/api_config.dart';
import 'package:dinero/core/http/api_exception.dart';
import 'package:dinero/core/storage/token_storage.dart';
import 'package:dio/dio.dart';

/// Cliente HTTP do Identity.
///
/// Encapsula uma instância [Dio] com:
/// - baseUrl = [ApiConfig.identityBaseUrl]
/// - interceptor que injeta `Authorization: Bearer <token>` lido do
///   [TokenStorage] (o token nunca é passado manualmente pelas telas)
/// - interceptor que, em 401, limpa o token (sessão expirada)
///
/// Os repositórios devem capturar [DioException] e convertê-la com
/// [toApiException] para uma exceção de domínio.
class ApiClient {
  final Dio dio;
  final TokenStorage _tokenStorage;

  ApiClient(this._tokenStorage)
      : dio = Dio(
          BaseOptions(
            baseUrl: ApiConfig.identityBaseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
            headers: {'Content-Type': 'application/json'},
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await _tokenStorage.clear();
          }
          handler.next(error);
        },
      ),
    );
  }

  /// Converte uma [DioException] em [ApiException], extraindo a mensagem do
  /// corpo do backend (`message` pode ser string ou lista de strings).
  ApiException toApiException(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;

    String message;
    if (data is Map && data['message'] != null) {
      final raw = data['message'];
      message = raw is List ? raw.join(', ') : raw.toString();
    } else if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.connectionError) {
      message = 'Não foi possível conectar ao servidor';
    } else {
      message = error.message ?? 'Erro inesperado';
    }

    return ApiException(message, statusCode: statusCode);
  }
}
