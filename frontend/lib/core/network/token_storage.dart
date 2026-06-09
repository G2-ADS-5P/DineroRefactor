/// Armazenamento em memória do JWT Bearer.
///
/// Nesta fase o token vive apenas na memória do processo. Quando o PIID-66
/// (Identity) for mergeado, este arquivo pode evoluir para persistência real
/// (ex.: `flutter_secure_storage`) sem que nenhum consumer precise mudar —
/// basta trocar a implementação interna.
///
/// Uso:
/// ```dart
/// tokenStorage.save(accessToken);
/// if (tokenStorage.hasToken) {
///   final token = tokenStorage.accessToken;
/// }
/// tokenStorage.clear(); // logout
/// ```
class TokenStorage {
  String? _token;

  /// O accessToken JWT atual, ou `null` se não houver sessão.
  String? get accessToken => _token;

  /// `true` enquanto houver token salvo.
  bool get hasToken => _token != null && _token!.isNotEmpty;

  /// Persiste o [token] recebido do endpoint de login/register.
  void save(String token) => _token = token;

  /// Remove o token (logout, 401, expiração).
  void clear() => _token = null;
}
