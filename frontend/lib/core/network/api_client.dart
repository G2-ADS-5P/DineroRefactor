import 'dart:convert';
import 'dart:io';

import 'package:dinero/core/config/app_config.dart';
import 'package:dinero/core/network/token_storage.dart';
import 'package:http/http.dart' as http;

// ---------------------------------------------------------------------------
// Tipos de erro
// ---------------------------------------------------------------------------

enum ApiErrorType { unauthorized, validation, server, network, unknown }

/// Exceção lançada pelo [ApiClient] para qualquer falha de rede ou HTTP.
///
/// Use o campo [type] para tomar decisões no ViewModel (ex.: redirecionar
/// para login no [ApiErrorType.unauthorized]).
class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final ApiErrorType type;

  const ApiException({
    required this.message,
    required this.type,
    this.statusCode,
  });

  @override
  String toString() {
    final code = statusCode != null ? ' (HTTP $statusCode)' : '';
    return 'ApiException$code: $message';
  }
}

// ---------------------------------------------------------------------------
// Resultado de lista HATEOAS
// ---------------------------------------------------------------------------

/// Retornado por [ApiClient.unwrapList] — os dados de negócio sem `_links`.
class HateoasList {
  final List<Map<String, dynamic>> items;
  final Map<String, dynamic> meta;

  const HateoasList({required this.items, required this.meta});
}

// ---------------------------------------------------------------------------
// ApiClient
// ---------------------------------------------------------------------------

/// Client HTTP centralizado para todos os microsserviços do Dinero.
///
/// **Uso básico nos repositórios HTTP:**
/// ```dart
/// // GET paginado (lista HATEOAS)
/// final raw = await _client.get(
///   BackendService.financial,
///   '/transactions',
///   query: {'_page': '1', '_size': '20'},
/// );
/// final result = ApiClient.unwrapList(raw);
/// // result.items → lista de Maps sem _links
/// // result.meta  → totalItems, totalPages etc.
///
/// // POST
/// final raw = await _client.post(
///   BackendService.financial,
///   '/transactions',
///   body: {'amount': 100.0, 'currency': 'BRL', ...},
/// );
/// final item = ApiClient.unwrapItem(raw);
/// ```
///
/// ---
///
/// **Padrão de mapper DTO → Model (exemplo para Card):**
/// ```dart
/// // CardModel.fromJson — renomeios da tabela de contrato PIID-67:
/// //   lastDigits → lastFour
/// //   brand      → network
/// //   dueDay     → dueDays
/// factory CardModel.fromJson(Map<String, dynamic> j) {
///   final brandColors = {
///     'MASTERCARD': AppColors.nubank,
///     'VISA':       AppColors.inter,
///   };
///   return CardModel(
///     id:          j['id'] as String,
///     name:        j['name'] as String,
///     lastFour:    j['lastDigits'] as String,        // ← renomeia
///     network:     (j['brand'] as String).toUpperCase(), // ← renomeia
///     creditLimit: double.tryParse(j['creditLimit']?.toString() ?? ''),
///     currentBill: double.parse(j['currentBill'].toString()),
///     dueDays:     j['dueDay'] as int,               // ← renomeia
///     color: brandColors[(j['brand'] as String).toUpperCase()]
///                ?? AppColors.surfaceAlt,
///   );
/// }
/// ```
class ApiClient {
  final TokenStorage _tokenStorage;
  final http.Client _httpClient;

  /// Hook chamado logo após um 401.
  /// Ligado ao `AuthViewModel.logout()` pelo card PIID-66 (Identity).
  /// Fica `null` nesta fase de fundação.
  final void Function()? onUnauthorized;

  ApiClient(
    this._tokenStorage, {
    http.Client? httpClient,
    this.onUnauthorized,
  }) : _httpClient = httpClient ?? http.Client();

  // -------------------------------------------------------------------------
  // Métodos HTTP públicos
  // -------------------------------------------------------------------------

  Future<dynamic> get(
    BackendService service,
    String path, {
    Map<String, String>? query,
  }) =>
      _send('GET', service, path, query: query);

  Future<dynamic> post(
    BackendService service,
    String path, {
    Object? body,
  }) =>
      _send('POST', service, path, body: body);

  Future<dynamic> put(
    BackendService service,
    String path, {
    Object? body,
  }) =>
      _send('PUT', service, path, body: body);

  Future<dynamic> patch(
    BackendService service,
    String path, {
    Object? body,
  }) =>
      _send('PATCH', service, path, body: body);

  Future<dynamic> delete(
    BackendService service,
    String path,
  ) =>
      _send('DELETE', service, path);

  // -------------------------------------------------------------------------
  // Helpers HATEOAS (estáticos — usados pelos repositórios HTTP)
  // -------------------------------------------------------------------------

  /// Desembrulha uma resposta de **lista** HATEOAS.
  ///
  /// Entrada esperada:
  /// ```json
  /// { "data": [ { ...campos, "_links": {} } ],
  ///   "meta": { "totalItems": 42, ... },
  ///   "_links": {} }
  /// ```
  /// Saída: [HateoasList.items] sem `_links`, [HateoasList.meta] intacto.
  static HateoasList unwrapList(dynamic json) {
    final map = json as Map<String, dynamic>;
    final rawList = (map['data'] as List<dynamic>? ?? []);
    final items = rawList.map((e) {
      final item = Map<String, dynamic>.from(e as Map);
      item.remove('_links');
      return item;
    }).toList();
    final meta = Map<String, dynamic>.from(
      (map['meta'] as Map<String, dynamic>?) ?? {},
    );
    return HateoasList(items: items, meta: meta);
  }

  /// Desembrulha uma resposta de **item** HATEOAS.
  ///
  /// Remove `_links` do mapa raiz. Models e ViewModels nunca veem `_links`.
  static Map<String, dynamic> unwrapItem(dynamic json) {
    final item = Map<String, dynamic>.from(json as Map<String, dynamic>);
    item.remove('_links');
    return item;
  }

  // -------------------------------------------------------------------------
  // Núcleo privado
  // -------------------------------------------------------------------------

  Future<dynamic> _send(
    String method,
    BackendService service,
    String path, {
    Map<String, String>? query,
    Object? body,
  }) async {
    final uri = _buildUri(service, path, query);
    final headers = _buildHeaders();
    final encodedBody = body != null ? jsonEncode(body) : null;

    try {
      final request = http.Request(method, uri)..headers.addAll(headers);
      if (encodedBody != null) request.body = encodedBody;

      final streamed = await _httpClient.send(request);
      final response = await http.Response.fromStream(streamed);

      return _handleResponse(response);
    } on SocketException catch (e) {
      throw ApiException(
        message: 'Sem conexão com o servidor: ${e.message}',
        type: ApiErrorType.network,
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException(
        message: 'Erro inesperado: $e',
        type: ApiErrorType.unknown,
      );
    }
  }

  Uri _buildUri(
    BackendService service,
    String path,
    Map<String, String>? query,
  ) {
    final base = AppConfig.baseUrl(service);
    final fullPath = base + (path.startsWith('/') ? path : '/$path');

    if (AppConfig.useProxy) {
      // Proxy mode: URL relativa (scheme/host vêm do nginx)
      final uri = Uri.parse(fullPath);
      return query != null ? uri.replace(queryParameters: query) : uri;
    } else {
      // Dev mode: URL absoluta com host
      final uri = Uri.parse(fullPath);
      return query != null ? uri.replace(queryParameters: query) : uri;
    }
  }

  Map<String, String> _buildHeaders() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_tokenStorage.hasToken) {
      headers['Authorization'] = 'Bearer ${_tokenStorage.accessToken}';
    }
    return headers;
  }

  dynamic _handleResponse(http.Response response) {
    final status = response.statusCode;

    // 204 No Content (soft delete, etc.)
    if (status == 204) return null;

    // 2xx com corpo
    if (status >= 200 && status < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    }

    // 401 Unauthorized
    if (status == 401) {
      _tokenStorage.clear();
      onUnauthorized?.call();
      throw ApiException(
        statusCode: status,
        message: 'Sessão expirada. Faça login novamente.',
        type: ApiErrorType.unauthorized,
      );
    }

    // 400 Bad Request (ValidationPipe whitelist)
    if (status == 400) {
      final msg = _extractNestMessage(response.body);
      throw ApiException(
        statusCode: status,
        message: msg,
        type: ApiErrorType.validation,
      );
    }

    // 5xx Server Error
    if (status >= 500) {
      throw ApiException(
        statusCode: status,
        message: 'Erro interno do servidor.',
        type: ApiErrorType.server,
      );
    }

    // Qualquer outro código inesperado
    throw ApiException(
      statusCode: status,
      message: 'Resposta inesperada do servidor.',
      type: ApiErrorType.unknown,
    );
  }

  /// Extrai a mensagem de erro do corpo JSON do NestJS.
  ///
  /// O campo `message` pode ser `String` (erro simples) ou `List<String>`
  /// (erros de validação do `class-validator`).
  String _extractNestMessage(String rawBody) {
    try {
      final json = jsonDecode(rawBody) as Map<String, dynamic>;
      final msg = json['message'];
      if (msg is List) return msg.join('; ');
      if (msg is String) return msg;
      return json['error']?.toString() ?? 'Erro de validação.';
    } catch (_) {
      return 'Erro de validação.';
    }
  }
}
