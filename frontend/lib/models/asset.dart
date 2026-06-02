enum AssetType { acoes, fiis, bdrs, etfs, cripto }

extension AssetTypeLabel on AssetType {
  String get label {
    switch (this) {
      case AssetType.acoes: return 'Ações';
      case AssetType.fiis:  return 'FIIs';
      case AssetType.bdrs:  return 'BDRs';
      case AssetType.etfs:  return 'ETFs';
      case AssetType.cripto: return 'Cripto';
    }
  }
}

class Asset {
  final String id;
  final String ticker;
  final String name;
  final int quantity;
  final double currentPrice;
  final double changePercent;
  final List<double> priceHistory;
  final String currency;
  final AssetType? assetType;

  const Asset({
    required this.id,
    required this.ticker,
    required this.name,
    required this.quantity,
    required this.currentPrice,
    required this.changePercent,
    required this.priceHistory,
    required this.currency,
    this.assetType,
  });

  double get totalValue => quantity * currentPrice;
}
