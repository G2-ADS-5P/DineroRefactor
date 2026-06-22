import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';

class MockAssetRepository implements IAssetRepository {
  @override
  Future<PortfolioSnapshot> getPortfolio({String range = '1A'}) async {
    final assets = await getAll(range: range);
    final totalValue = assets.fold(0.0, (sum, a) => sum + a.totalValue);
    final totalChange =
        assets.fold(0.0, (sum, a) => sum + a.changePercent * a.totalValue) /
            (totalValue > 0 ? totalValue : 1);

    return PortfolioSnapshot(
      assets: assets,
      totalValue: totalValue,
      totalChange: totalChange,
      history: assets.isEmpty
          ? const []
          : [
              PortfolioHistoryPoint(
                date: DateTime.now().subtract(const Duration(days: 3)),
                value: 18000,
              ),
              PortfolioHistoryPoint(
                date: DateTime.now().subtract(const Duration(days: 2)),
                value: 19500,
              ),
              PortfolioHistoryPoint(
                date: DateTime.now().subtract(const Duration(days: 1)),
                value: 18800,
              ),
              PortfolioHistoryPoint(date: DateTime.now(), value: 21000),
            ],
    );
  }

  @override
  Future<List<Asset>> getAll({String range = '1A'}) async => MockData.assets;

  @override
  Future<Asset?> getById(String id) async {
    try {
      return MockData.assets.firstWhere((a) => a.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Asset?> getMarketAssetById(
    String id, {
    String range = '1M',
  }) async {
    try {
      final marketAsset = MockData.searchableAssets.firstWhere(
        (asset) => asset.id == id,
      );
      final position = MockData.assets.cast<Asset?>().firstWhere(
            (asset) => asset?.ticker == marketAsset.ticker,
            orElse: () => null,
          );
      return marketAsset.copyWith(quantity: position?.quantity ?? 0);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<AssetHistorySeries> getHistory(
    String id, {
    String range = '1M',
  }) async {
    final asset = await getMarketAssetById(id, range: range);
    return AssetHistorySeries(
      values: asset?.priceHistory ?? const [],
      dates: asset?.priceHistoryDates ?? const [],
    );
  }

  @override
  Future<List<Asset>> search({
    String query = '',
    String? type,
    String range = '1M',
    int page = 1,
    int limit = 20,
  }) async =>
      MockData.searchableAssets;

  @override
  Future<Asset> addToPortfolio({
    required String ticker,
    required int quantity,
    required double averagePrice,
  }) async {
    return MockData.searchableAssets.firstWhere(
      (asset) => asset.ticker == ticker,
    );
  }

  @override
  Future<void> addTransaction({
    required String ticker,
    required String type,
    required int quantity,
    required double unitPrice,
  }) async {}
}
