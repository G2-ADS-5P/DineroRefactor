import 'package:dinero/core/http/api_client.dart';
import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:dio/dio.dart';

class HttpAssetRepository implements IAssetRepository {
  final ApiClient _client;

  HttpAssetRepository(this._client);

  @override
  Future<PortfolioSnapshot> getPortfolio({String range = '1A'}) async {
    try {
      final response = await _client.dio.get(
        '/portfolio',
        queryParameters: {'range': range},
      );
      return PortfolioSnapshot.fromJson(
        Map<String, dynamic>.from(response.data as Map),
      );
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }

  @override
  Future<List<Asset>> getAll({String range = '1A'}) async {
    final portfolio = await getPortfolio(range: range);
    return portfolio.assets;
  }

  @override
  Future<Asset?> getById(String id) async {
    try {
      final response = await _client.dio.get('/portfolio/assets/$id');
      final data = response.data;
      if (data == null) return null;
      final portfolioAsset =
          Asset.fromPortfolioJson(Map<String, dynamic>.from(data as Map));

      final assetId = portfolioAsset.assetId;
      if (assetId == null) return portfolioAsset;

      try {
        final detailResponse = await _client.dio.get(
          '/assets/$assetId',
          queryParameters: {'range': '1M'},
        );
        final detail = Asset.fromMarketJson(
          Map<String, dynamic>.from(detailResponse.data as Map),
        );

        return portfolioAsset.copyWith(
          priceHistory: detail.priceHistory.isEmpty
              ? portfolioAsset.priceHistory
              : detail.priceHistory,
          priceHistoryDates: detail.priceHistoryDates.isEmpty
              ? portfolioAsset.priceHistoryDates
              : detail.priceHistoryDates,
          assetType: detail.assetType,
          description: detail.description,
        );
      } on DioException {
        return portfolioAsset;
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw _client.toApiException(e);
    }
  }

  @override
  Future<Asset?> getMarketAssetById(
    String id, {
    String range = '1M',
  }) async {
    try {
      final responses = await Future.wait([
        _client.dio.get('/assets/$id', queryParameters: {'range': range}),
        _client.dio.get('/portfolio', queryParameters: {'range': range}),
      ]);
      final marketAsset = Asset.fromMarketJson(
        Map<String, dynamic>.from(responses[0].data as Map),
      );
      final portfolio = PortfolioSnapshot.fromJson(
        Map<String, dynamic>.from(responses[1].data as Map),
      );

      final position = portfolio.assets.cast<Asset?>().firstWhere(
            (asset) =>
                asset?.assetId == id || asset?.ticker == marketAsset.ticker,
            orElse: () => null,
          );

      return marketAsset.copyWith(
        assetId: id,
        quantity: position?.quantity ?? 0,
      );
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw _client.toApiException(e);
    }
  }

  @override
  Future<List<Asset>> search({
    String query = '',
    String? type,
    String range = '1M',
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _client.dio.get(
        '/assets',
        queryParameters: {
          '_page': page,
          '_size': limit,
          'range': range,
          if (query.trim().isNotEmpty) 'q': query.trim(),
          if (type != null) 'type': type,
        },
      );

      final body = Map<String, dynamic>.from(response.data as Map);
      final data = body['data'];
      if (data is! List) return const [];

      return data
          .whereType<Map>()
          .map((item) => Asset.fromMarketJson(Map<String, dynamic>.from(item)))
          .toList();
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }

  @override
  Future<Asset> addToPortfolio({
    required String ticker,
    required int quantity,
    required double averagePrice,
  }) async {
    try {
      final response = await _client.dio.post(
        '/portfolio/assets',
        data: {
          'ticker': ticker,
          'quantity': quantity,
          'averagePrice': averagePrice,
        },
      );
      return Asset.fromPortfolioJson(
        Map<String, dynamic>.from(response.data as Map),
      );
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }

  @override
  Future<void> addTransaction({
    required String ticker,
    required String type,
    required int quantity,
    required double unitPrice,
  }) async {
    try {
      await _client.dio.post(
        '/portfolio/transactions',
        data: {
          'ticker': ticker,
          'type': type,
          'operationDate': DateTime.now().toUtc().toIso8601String(),
          'quantity': quantity,
          'unitPrice': unitPrice,
          'costs': 0,
        },
      );
    } on DioException catch (e) {
      throw _client.toApiException(e);
    }
  }
}
