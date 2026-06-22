class ApiException implements Exception {
  final int? statusCode;
  final String? code;
  final String message;
  final Map<String, dynamic>? details;
  final String? correlationId;

  const ApiException(
    this.message, {
    this.statusCode,
    this.code,
    this.details,
    this.correlationId,
  });

  @override
  String toString() => message;
}
