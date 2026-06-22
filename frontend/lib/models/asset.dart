enum AssetType { acoes, fiis, bdrs, etfs, cripto }

extension AssetTypeLabel on AssetType {
  String get label {
    switch (this) {
      case AssetType.acoes:
        return 'Ações';
      case AssetType.fiis:
        return 'FIIs';
      case AssetType.bdrs:
        return 'BDRs';
      case AssetType.etfs:
        return 'ETFs';
      case AssetType.cripto:
        return 'Cripto';
    }
  }
}

class Asset {
  final String id;
  final String? assetId;
  final String ticker;
  final String name;
  final int quantity;
  final double currentPrice;
  final double changePercent;
  final List<double> priceHistory;
  final List<DateTime> priceHistoryDates;
  final String currency;
  final AssetType? assetType;
  final String? description;

  const Asset({
    required this.id,
    this.assetId,
    required this.ticker,
    required this.name,
    required this.quantity,
    required this.currentPrice,
    required this.changePercent,
    required this.priceHistory,
    this.priceHistoryDates = const [],
    required this.currency,
    this.assetType,
    this.description,
  });

  double get totalValue => quantity * currentPrice;

  Asset copyWith({
    String? id,
    String? assetId,
    String? ticker,
    String? name,
    int? quantity,
    double? currentPrice,
    double? changePercent,
    List<double>? priceHistory,
    List<DateTime>? priceHistoryDates,
    String? currency,
    AssetType? assetType,
    String? description,
  }) {
    return Asset(
      id: id ?? this.id,
      assetId: assetId ?? this.assetId,
      ticker: ticker ?? this.ticker,
      name: name ?? this.name,
      quantity: quantity ?? this.quantity,
      currentPrice: currentPrice ?? this.currentPrice,
      changePercent: changePercent ?? this.changePercent,
      priceHistory: priceHistory ?? this.priceHistory,
      priceHistoryDates: priceHistoryDates ?? this.priceHistoryDates,
      currency: currency ?? this.currency,
      assetType: assetType ?? this.assetType,
      description: description ?? this.description,
    );
  }

  factory Asset.fromPortfolioJson(Map<String, dynamic> json) {
    return Asset(
      id: (json['id'] ?? json['assetId'] ?? json['ticker']).toString(),
      assetId: json['assetId']?.toString(),
      ticker: (json['ticker'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      quantity: _toInt(json['quantity']),
      currentPrice: _toDouble(json['currentPrice']),
      changePercent: _toDouble(
        json['changePercent'] ?? json['variationPercent'],
      ),
      priceHistory: _historyValues(json['history']),
      priceHistoryDates: _historyDates(json['history']),
      currency: (json['currency'] ?? 'BRL').toString(),
      assetType: AssetTypeMapper.fromApi(json['type']?.toString()),
      description: _toNullableString(json['description']),
    );
  }

  factory Asset.fromMarketJson(Map<String, dynamic> json) {
    return Asset(
      id: (json['id'] ?? json['ticker']).toString(),
      ticker: (json['ticker'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      quantity: _toInt(json['quantity']),
      currentPrice: _toDouble(json['currentPrice']),
      changePercent: _toDouble(json['changePercent']),
      priceHistory: _historyValues(json['history']),
      priceHistoryDates: _historyDates(json['history']),
      currency: (json['currency'] ?? 'BRL').toString(),
      assetType: AssetTypeMapper.fromApi(json['type']?.toString()),
      description: _toNullableString(json['description']),
    );
  }

  static String? _toNullableString(Object? value) {
    final text = value?.toString().trim();
    return text == null || text.isEmpty ? null : text;
  }

  static int _toInt(Object? value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }

  static double _toDouble(Object? value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }

  static List<double> _historyValues(Object? value) {
    if (value is! List) return const [];
    return value
        .map((item) {
          if (item is num) return item.toDouble();
          if (item is Map) return _toDouble(item['value']);
          return null;
        })
        .whereType<double>()
        .toList();
  }

  static List<DateTime> _historyDates(Object? value) {
    if (value is! List) return const [];
    return value
        .whereType<Map>()
        .map((item) => DateTime.tryParse(item['date']?.toString() ?? ''))
        .whereType<DateTime>()
        .toList();
  }
}

class PortfolioSnapshot {
  final List<Asset> assets;
  final double totalValue;
  final double totalChange;
  final List<PortfolioHistoryPoint> history;

  const PortfolioSnapshot({
    required this.assets,
    required this.totalValue,
    required this.totalChange,
    required this.history,
  });

  factory PortfolioSnapshot.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    final assets = rawItems is List
        ? rawItems
            .whereType<Map>()
            .map(
              (item) =>
                  Asset.fromPortfolioJson(Map<String, dynamic>.from(item)),
            )
            .toList()
        : <Asset>[];

    final rawHistory = json['history'];
    final history = rawHistory is List
        ? rawHistory
            .whereType<Map>()
            .map(
              (item) => PortfolioHistoryPoint.fromJson(
                Map<String, dynamic>.from(item),
              ),
            )
            .toList()
        : <PortfolioHistoryPoint>[];

    return PortfolioSnapshot(
      assets: assets,
      totalValue: Asset._toDouble(json['currentValue']),
      totalChange: Asset._toDouble(json['variationPercent']),
      history: history,
    );
  }
}

class PortfolioHistoryPoint {
  final DateTime date;
  final double value;

  const PortfolioHistoryPoint({required this.date, required this.value});

  factory PortfolioHistoryPoint.fromJson(Map<String, dynamic> json) {
    return PortfolioHistoryPoint(
      date: DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now(),
      value: Asset._toDouble(json['value']),
    );
  }
}

class AssetTypeMapper {
  static AssetType? fromApi(String? value) {
    final normalized = value?.toUpperCase();

    switch (normalized) {
      case 'ACAO':
      case 'ACOES':
        return AssetType.acoes;
      case 'FII':
      case 'FIIS':
        return AssetType.fiis;
      case 'BDR':
      case 'BDRS':
        return AssetType.bdrs;
      case 'ETF':
      case 'ETFS':
        return AssetType.etfs;
      case 'CRIPTO':
      case 'CRYPTO':
        return AssetType.cripto;
      default:
        return null;
    }
  }

  static String? toApi(String filter) {
    final normalized = filter.toUpperCase();
    if (normalized == 'TODOS') return null;
    if (normalized.startsWith('A')) return 'ACAO';
    if (normalized.contains('FII')) return 'FII';
    if (normalized.contains('BDR')) return 'BDR';
    if (normalized.contains('ETF')) return 'ETF';
    if (normalized.contains('CRIPTO') || normalized.contains('CRYPTO')) {
      return 'CRIPTO';
    }
    return null;
  }
}
