import 'package:dinero/models/asset.dart';

abstract class IAssetRepository {
  Future<PortfolioSnapshot> getPortfolio({String range = '1A'});
  Future<List<Asset>> getAll({String range = '1A'});
  Future<Asset?> getById(String id);
  Future<Asset?> getMarketAssetById(String id, {String range = '1M'});
  Future<AssetHistorySeries> getHistory(
    String id, {
    String range = '1M',
  });
  Future<List<Asset>> search({
    String query = '',
    String? type,
    String range = '1M',
    int page = 1,
    int limit = 20,
  });
  Future<Asset> addToPortfolio({
    required String ticker,
    required int quantity,
    required double averagePrice,
  });
  Future<void> addTransaction({
    required String ticker,
    required String type,
    required int quantity,
    required double unitPrice,
  });
}
