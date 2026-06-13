abstract class IPreferenceRepository {
  /// GET /preferences/me → defaultCurrency
  Future<String> getDefaultCurrency();

  /// PUT /preferences/currency
  Future<void> updateCurrency(String currency);
}
