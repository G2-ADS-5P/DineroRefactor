import 'dart:async';

import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetSearchState {
  final List<Asset> allAssets;
  final List<Asset> filteredAssets;
  final String query;
  final String selectedFilter;
  final bool isLoading;
  final bool isAdding;
  final String? errorMessage;

  const AssetSearchState({
    required this.allAssets,
    required this.filteredAssets,
    this.query = '',
    this.selectedFilter = 'Todos',
    this.isLoading = false,
    this.isAdding = false,
    this.errorMessage,
  });

  AssetSearchState copyWith({
    List<Asset>? allAssets,
    List<Asset>? filteredAssets,
    String? query,
    String? selectedFilter,
    bool? isLoading,
    bool? isAdding,
    String? errorMessage,
  }) {
    return AssetSearchState(
      allAssets: allAssets ?? this.allAssets,
      filteredAssets: filteredAssets ?? this.filteredAssets,
      query: query ?? this.query,
      selectedFilter: selectedFilter ?? this.selectedFilter,
      isLoading: isLoading ?? this.isLoading,
      isAdding: isAdding ?? this.isAdding,
      errorMessage: errorMessage,
    );
  }
}

class AssetSearchViewModel extends StateNotifier<AssetSearchState> {
  final IAssetRepository _repo;
  Timer? _debounce;

  AssetSearchViewModel(this._repo)
    : super(
        const AssetSearchState(
          allAssets: [],
          filteredAssets: [],
          isLoading: true,
        ),
      ) {
    load();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> load() async {
    await _fetch(query: state.query, filter: state.selectedFilter);
  }

  void search(String query) {
    state = state.copyWith(query: query, isLoading: true, errorMessage: null);
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 600), () {
      _fetch(query: query, filter: state.selectedFilter);
    });
  }

  Future<void> setFilter(String filter) async {
    state = state.copyWith(selectedFilter: filter);
    await _fetch(query: state.query, filter: filter);
  }

  Future<bool> addToPortfolio({
    required Asset asset,
    required int quantity,
    required double averagePrice,
  }) async {
    state = state.copyWith(isAdding: true, errorMessage: null);
    try {
      await _repo.addToPortfolio(
        ticker: asset.ticker,
        quantity: quantity,
        averagePrice: averagePrice,
      );
      state = state.copyWith(isAdding: false, errorMessage: null);
      return true;
    } catch (e) {
      state = state.copyWith(isAdding: false, errorMessage: e.toString());
      return false;
    }
  }

  Future<void> _fetch({required String query, required String filter}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final assets = await _repo.search(
        query: query,
        type: AssetTypeMapper.toApi(filter),
        limit: 30,
      );
      state = state.copyWith(
        allAssets: assets,
        filteredAssets: assets,
        isLoading: false,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }
}
