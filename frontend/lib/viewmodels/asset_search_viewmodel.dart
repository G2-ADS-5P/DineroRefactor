import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:dinero/viewmodels/asset_cache_notifier.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetSearchState {
  final List<Asset> filteredAssets;
  final String query;
  final String selectedFilter;
  final bool isLoading;
  final bool isAdding;
  final String? errorMessage;

  const AssetSearchState({
    this.filteredAssets = const [],
    this.query = '',
    this.selectedFilter = 'Todos',
    this.isLoading = false,
    this.isAdding = false,
    this.errorMessage,
  });

  AssetSearchState copyWith({
    List<Asset>? filteredAssets,
    String? query,
    String? selectedFilter,
    bool? isLoading,
    bool? isAdding,
    String? errorMessage,
  }) =>
      AssetSearchState(
        filteredAssets: filteredAssets ?? this.filteredAssets,
        query: query ?? this.query,
        selectedFilter: selectedFilter ?? this.selectedFilter,
        isLoading: isLoading ?? this.isLoading,
        isAdding: isAdding ?? this.isAdding,
        errorMessage: errorMessage,
      );
}

class AssetSearchViewModel extends StateNotifier<AssetSearchState> {
  final IAssetRepository _repo;
  final AssetCacheNotifier _cache;

  AssetSearchViewModel(this._repo, this._cache)
      : super(const AssetSearchState()) {
    // Exibe imediatamente o que já está no cache
    final cached = _applyFilters(_cache.state.assets, '', 'Todos');
    state = state.copyWith(filteredAssets: cached);
  }

  // Filtragem local instantânea — sem rede
  void search(String query) {
    final cached = _applyFilters(_cache.state.assets, query, state.selectedFilter);
    state = state.copyWith(query: query, filteredAssets: cached, errorMessage: null);

    // Se não achou nada no cache com 3+ caracteres, tenta backend
    if (cached.isEmpty && query.trim().length >= 3) {
      _searchBackend(query);
    }
  }

  void setFilter(String filter) {
    final filtered = _applyFilters(_cache.state.assets, state.query, filter);
    state = state.copyWith(selectedFilter: filter, filteredAssets: filtered);
  }

  // Backend search — só chamado quando o cache não tem resultados suficientes
  Future<void> _searchBackend(String query) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final results = await _repo.search(query: query, limit: 10);
      _cache.addResults(results);
      final filtered = _applyFilters(_cache.state.assets, query, state.selectedFilter);
      state = state.copyWith(filteredAssets: filtered, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
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
      state = state.copyWith(isAdding: false);
      return true;
    } catch (e) {
      state = state.copyWith(isAdding: false, errorMessage: e.toString());
      return false;
    }
  }

  List<Asset> _applyFilters(List<Asset> assets, String query, String filter) {
    var result = assets;

    final q = query.toLowerCase().trim();
    if (q.isNotEmpty) {
      result = result.where((a) {
        return a.ticker.toLowerCase().contains(q) ||
            a.name.toLowerCase().contains(q);
      }).toList();
    }

    if (filter != 'Todos') {
      final typeMap = {
        'Ações': AssetType.acoes,
        'FIIs': AssetType.fiis,
        'BDRs': AssetType.bdrs,
        'ETFs': AssetType.etfs,
        'Cripto': AssetType.cripto,
      };
      final type = typeMap[filter];
      if (type != null) {
        result = result.where((a) => a.assetType == type).toList();
      }
    }

    return result;
  }
}
