import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wrapper sobre [FlutterSecureStorage] para o JWT do Identity.
///
/// O token nunca é exposto às telas — só o interceptor do Dio o lê.
class TokenStorage {
  static const _tokenKey = 'identity_access_token';

  final FlutterSecureStorage _storage;

  TokenStorage([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  Future<void> saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  Future<String?> getToken() => _storage.read(key: _tokenKey);

  Future<void> clear() => _storage.delete(key: _tokenKey);
}
