import 'dart:async';

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
        // errorMessage: null por padrão ao não passar = limpa o erro
        errorMessage: errorMessage,
      );
}

class AssetSearchViewModel extends StateNotifier<AssetSearchState> {
  final IAssetRepository _repo;
  final AssetCacheNotifier _cache;
  Timer? _searchDebounce;
  int _requestId = 0;
  final Map<String, AssetHistorySeries> _historyCache = {};

  AssetSearchViewModel(this._repo, this._cache)
      : super(const AssetSearchState()) {
    // Exibe imediatamente o que já está no cache (pode ser vazio no início)
    _updateFromCache();
    _loadInitial();
  }

  void _updateFromCache() {
    final filtered = _applyFilters(
      _cache.state.assets,
      state.query,
      state.selectedFilter,
    );
    state = state.copyWith(filteredAssets: filtered);
  }

  // Filtragem local instantânea — sem rede
  void search(String query) {
    final cached = _applyFilters(
      _cache.state.assets,
      query,
      state.selectedFilter,
    );
    // Limpa erro anterior ao digitar
    state = AssetSearchState(
      filteredAssets: cached,
      query: query,
      selectedFilter: state.selectedFilter,
    );

    _searchDebounce?.cancel();
    if (query.trim().isEmpty) return;

    _searchDebounce = Timer(
      const Duration(milliseconds: 350),
      () => _searchBackend(query, type: _selectedApiType()),
    );
  }

  void setFilter(String filter) {
    final filtered = _applyFilters(_cache.state.assets, state.query, filter);
    state = state.copyWith(selectedFilter: filter, filteredAssets: filtered);
    _searchDebounce?.cancel();
    _searchBackend(state.query, type: AssetTypeMapper.toApi(filter));
  }

  Future<void> _loadInitial() async {
    if (!_cache.state.isEmpty) return;
    await _searchBackend('', type: null);
  }

  Future<void> _searchBackend(String query, {String? type}) async {
    final requestId = ++_requestId;
    state = state.copyWith(isLoading: true);
    try {
      final results = await _repo.search(
        query: query,
        type: type,
        limit: 20,
      );
      if (requestId != _requestId) return;
      _cache.addResults(results);
      final filtered = _applyFilters(
        _cache.state.assets,
        query,
        state.selectedFilter,
      );
      state = state.copyWith(filteredAssets: filtered, isLoading: false);
    } catch (error) {
      if (requestId != _requestId) return;
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      );
    }
  }

  String? _selectedApiType() => AssetTypeMapper.toApi(state.selectedFilter);

  Future<AssetHistorySeries> loadHistory(String assetId) async {
    final cached = _historyCache[assetId];
    if (cached != null) return cached;

    final series = await _repo.getHistory(assetId, range: '1M');
    _historyCache[assetId] = series;
    return series;
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

  @override
  void dispose() {
    _searchDebounce?.cancel();
    super.dispose();
  }
}
