import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PortfolioState {
  final List<Asset> assets;
  final double totalValue;
  final double totalChange;
  final List<PortfolioHistoryPoint> history;
  final bool isLoading;
  final String? errorMessage;

  const PortfolioState({
    this.assets = const [],
    this.totalValue = 0,
    this.totalChange = 0,
    this.history = const [],
    this.isLoading = true,
    this.errorMessage,
  });

  PortfolioState copyWith({
    List<Asset>? assets,
    double? totalValue,
    double? totalChange,
    List<PortfolioHistoryPoint>? history,
    bool? isLoading,
    String? errorMessage,
  }) =>
      PortfolioState(
        assets: assets ?? this.assets,
        totalValue: totalValue ?? this.totalValue,
        totalChange: totalChange ?? this.totalChange,
        history: history ?? this.history,
        isLoading: isLoading ?? this.isLoading,
        errorMessage: errorMessage,
      );
}

class PortfolioViewModel extends StateNotifier<PortfolioState> {
  final IAssetRepository _repo;

  PortfolioViewModel(this._repo) : super(const PortfolioState()) {
    load();
  }

  Future<void> load({String range = '1A'}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final portfolio = await _repo.getPortfolio(range: range);
      state = state.copyWith(
        assets: portfolio.assets,
        totalValue: portfolio.totalValue,
        totalChange: portfolio.totalChange,
        history: portfolio.history,
        isLoading: false,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }
}
