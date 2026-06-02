import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/models/asset.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetSearchState {
  final List<Asset> allAssets;
  final List<Asset> filteredAssets;
  final String query;
  final String selectedFilter;

  const AssetSearchState({
    required this.allAssets,
    required this.filteredAssets,
    this.query = '',
    this.selectedFilter = 'Todos',
  });

  AssetSearchState copyWith({
    List<Asset>? allAssets,
    List<Asset>? filteredAssets,
    String? query,
    String? selectedFilter,
  }) {
    return AssetSearchState(
      allAssets: allAssets ?? this.allAssets,
      filteredAssets: filteredAssets ?? this.filteredAssets,
      query: query ?? this.query,
      selectedFilter: selectedFilter ?? this.selectedFilter,
    );
  }
}

class AssetSearchViewModel extends StateNotifier<AssetSearchState> {
  AssetSearchViewModel()
      : super(AssetSearchState(
          allAssets: MockData.searchableAssets,
          filteredAssets: MockData.searchableAssets,
        ));

  void search(String query) {
    state = state.copyWith(query: query, filteredAssets: _apply(query, state.selectedFilter));
  }

  void setFilter(String filter) {
    state = state.copyWith(selectedFilter: filter, filteredAssets: _apply(state.query, filter));
  }

  List<Asset> _apply(String query, String filter) {
    var result = state.allAssets;

    if (filter != 'Todos') {
      final type = _filterToType(filter);
      if (type != null) {
        result = result.where((a) => a.assetType == type).toList();
      }
    }

    if (query.trim().isNotEmpty) {
      final q = query.trim().toUpperCase();
      result = result.where((a) {
        return a.ticker.toUpperCase().contains(q) ||
            a.name.toUpperCase().contains(q);
      }).toList();
    }

    return result;
  }

  AssetType? _filterToType(String filter) {
    switch (filter) {
      case 'Ações': return AssetType.acoes;
      case 'FIIs':  return AssetType.fiis;
      case 'BDRs':  return AssetType.bdrs;
      case 'ETFs':  return AssetType.etfs;
      case 'Cripto': return AssetType.cripto;
      default: return null;
    }
  }
}
