import 'package:flutter/foundation.dart';

class ApiConfig {
  static String get _host =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.android
          ? '10.0.2.2'
          : 'localhost';

  static String get identityBaseUrl => 'http://$_host:4008/v1';
  static String get portfolioBaseUrl => 'http://$_host:4007/v1';
}
