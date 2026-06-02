import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PortfolioState {
  final List<Asset> assets;
  final double totalValue;
  final double totalChange;
  final bool isLoading;

  const PortfolioState({
    this.assets = const [],
    this.totalValue = 0,
    this.totalChange = 0,
    this.isLoading = true,
  });

  PortfolioState copyWith({
    List<Asset>? assets,
    double? totalValue,
    double? totalChange,
    bool? isLoading,
  }) =>
      PortfolioState(
        assets: assets ?? this.assets,
        totalValue: totalValue ?? this.totalValue,
        totalChange: totalChange ?? this.totalChange,
        isLoading: isLoading ?? this.isLoading,
      );
}

class PortfolioViewModel extends StateNotifier<PortfolioState> {
  final IAssetRepository _repo;

  PortfolioViewModel(this._repo) : super(const PortfolioState()) {
    _load();
  }

  Future<void> _load() async {
    final assets = await _repo.getAll();
    final totalValue = assets.fold(0.0, (sum, a) => sum + a.totalValue);
    final weightedChange = assets.fold(0.0, (sum, a) => sum + a.changePercent * a.totalValue) / (totalValue > 0 ? totalValue : 1);
    state = state.copyWith(
      assets: assets,
      totalValue: totalValue,
      totalChange: weightedChange,
      isLoading: false,
    );
  }
}
