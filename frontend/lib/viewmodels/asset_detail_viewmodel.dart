import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetDetailState {
  final Asset? asset;
  final bool isLoading;
  final bool isProcessing;
  final String? errorMessage;

  const AssetDetailState({
    this.asset,
    this.isLoading = true,
    this.isProcessing = false,
    this.errorMessage,
  });

  AssetDetailState copyWith({
    Asset? asset,
    bool? isLoading,
    bool? isProcessing,
    String? errorMessage,
  }) =>
      AssetDetailState(
        asset: asset ?? this.asset,
        isLoading: isLoading ?? this.isLoading,
        isProcessing: isProcessing ?? this.isProcessing,
        errorMessage: errorMessage,
      );
}

class AssetDetailViewModel extends StateNotifier<AssetDetailState> {
  final IAssetRepository _repo;

  AssetDetailViewModel(this._repo) : super(const AssetDetailState());

  Future<void> load(String id, {bool marketAsset = false}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final asset = marketAsset
          ? await _repo.getMarketAssetById(id)
          : await _repo.getById(id);
      state = state.copyWith(
        asset: asset,
        isLoading: false,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<bool> addTransaction({
    required String id,
    required bool marketAsset,
    required String ticker,
    required String type,
    required int quantity,
    required double unitPrice,
  }) async {
    state = state.copyWith(isProcessing: true, errorMessage: null);
    try {
      await _repo.addTransaction(
        ticker: ticker,
        type: type,
        quantity: quantity,
        unitPrice: unitPrice,
      );
      state = state.copyWith(isProcessing: false);
      await load(id, marketAsset: marketAsset);
      return true;
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }
}
