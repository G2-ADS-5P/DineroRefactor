/// Configuração de base de URL por serviço.
///
/// Para alternar entre dev (localhost) e prod (nginx proxy), mude apenas
/// [useProxy]. Todas as portas e paths vivem exclusivamente aqui.
///
/// Mapeamento esperado no nginx.conf do container:
///   /api/identity/    → http://identity:4008/v1/
///   /api/financial/   → http://financial:4009/v1/
///   /api/openfinance/ → http://openfinance:4006/v1/
///   /api/portfolio/   → http://portfolio:4007/v1/
library app_config;

import 'package:flutter/foundation.dart';

/// Os 4 microsserviços do backend Dinero.
enum BackendService { identity, financial, openfinance, portfolio }

class AppConfig {
  AppConfig._();

  /// `false` → dev (http://HOST:PORTA/v1)
  /// `true`  → proxy nginx (/api/<servico>)
  static const bool useProxy = false;

  // No emulador Android, `localhost` aponta para o próprio dispositivo.
  // `10.0.2.2` é o alias que redireciona para a máquina host.
  static String get _host =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.android
          ? '10.0.2.2'
          : 'localhost';

  static const Map<BackendService, int> _devPorts = {
    BackendService.identity: 4008,
    BackendService.financial: 4009,
    BackendService.openfinance: 4006,
    BackendService.portfolio: 4007,
  };

  static const Map<BackendService, String> _proxyPaths = {
    BackendService.identity: '/api/identity',
    BackendService.financial: '/api/financial',
    BackendService.openfinance: '/api/openfinance',
    BackendService.portfolio: '/api/portfolio',
  };

  static String baseUrl(BackendService service) {
    if (useProxy) return _proxyPaths[service]!;
    return 'http://$_host:${_devPorts[service]!}/v1';
  }
}
