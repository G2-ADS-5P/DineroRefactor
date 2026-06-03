import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetDetailState {
  final Asset? asset;
  final bool isLoading;

  const AssetDetailState({this.asset, this.isLoading = true});

  AssetDetailState copyWith({Asset? asset, bool? isLoading}) => AssetDetailState(
        asset: asset ?? this.asset,
        isLoading: isLoading ?? this.isLoading,
      );
}

class AssetDetailViewModel extends StateNotifier<AssetDetailState> {
  final IAssetRepository _repo;

  AssetDetailViewModel(this._repo) : super(const AssetDetailState());

  Future<void> load(String id) async {
    final asset = await _repo.getById(id);
    state = state.copyWith(asset: asset, isLoading: false);
  }
}
