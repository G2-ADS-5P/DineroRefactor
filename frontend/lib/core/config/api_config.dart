class ApiConfig {
  /// Base URL do microsserviço Identity.
  ///
  /// Em emulador Android, `localhost` aponta para o próprio emulador — use
  /// `10.0.2.2` para alcançar a máquina host. iOS simulator e web aceitam
  /// `localhost`. Para sobrescrever em runtime:
  ///
  ///   flutter run --dart-define=IDENTITY_BASE_URL=http://10.0.2.2:4008/v1
  static const String identityBaseUrl = String.fromEnvironment(
    'IDENTITY_BASE_URL',
    defaultValue: 'http://localhost:4008/v1',
  );

  /// Base URL do microsservico Portfolio.
  static const String portfolioBaseUrl = String.fromEnvironment(
    'PORTFOLIO_BASE_URL',
    defaultValue: 'http://localhost:4007/v1',
  );
}
