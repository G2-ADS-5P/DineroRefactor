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

/// Os 4 microsserviços do backend Dinero.
enum BackendService { identity, financial, openfinance, portfolio }

class AppConfig {
  AppConfig._();

  /// `false` → dev (http://localhost:PORTA/v1)
  /// `true`  → proxy nginx (/api/<servico>)
  ///
  /// Mude para `true` quando o Flutter estiver rodando dentro do container
  /// (ou atrás de um nginx local que encaminhe /api/*).
  static const bool useProxy = false;

  // ---------------------------------------------------------------------------
  // Portas dev (só usadas quando useProxy == false)
  // ---------------------------------------------------------------------------
  static const Map<BackendService, int> _devPorts = {
    BackendService.identity: 4008,
    BackendService.financial: 4009,
    BackendService.openfinance: 4006,
    BackendService.portfolio: 4007,
  };

  // ---------------------------------------------------------------------------
  // Paths proxy (só usados quando useProxy == true)
  // ---------------------------------------------------------------------------
  static const Map<BackendService, String> _proxyPaths = {
    BackendService.identity: '/api/identity',
    BackendService.financial: '/api/financial',
    BackendService.openfinance: '/api/openfinance',
    BackendService.portfolio: '/api/portfolio',
  };

  /// Retorna a base URL do serviço, **sem** barra final.
  ///
  /// Exemplos:
  /// ```
  /// AppConfig.baseUrl(BackendService.financial)
  ///   → "http://localhost:4009/v1"  (dev)
  ///   → "/api/financial"            (proxy)
  /// ```
  static String baseUrl(BackendService service) {
    if (useProxy) {
      return _proxyPaths[service]!;
    }
    final port = _devPorts[service]!;
    return 'http://localhost:$port/v1';
  }
}
