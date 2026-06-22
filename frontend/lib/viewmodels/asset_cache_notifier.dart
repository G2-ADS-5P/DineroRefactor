import 'dart:async';

import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetCacheState {
  final Map<String, Asset> _byId;

  const AssetCacheState({Map<String, Asset>? byId}) : _byId = byId ?? const {};

  List<Asset> get assets => _byId.values.toList();
  bool get isEmpty => _byId.isEmpty;

  AssetCacheState withAssets(Map<String, Asset> byId) =>
      AssetCacheState(byId: byId);
}

class AssetCacheNotifier extends StateNotifier<AssetCacheState> {
  final IAssetRepository _repo;
  Timer? _timer;

  AssetCacheNotifier(this._repo) : super(const AssetCacheState()) {
    // Atualiza a cada 5 minutos apenas os itens já carregados
    _timer = Timer.periodic(
      const Duration(minutes: 5),
      (_) => _refreshExisting(),
    );
  }

  // Re-busca apenas os tickers que já estão no cache para preços frescos
  Future<void> _refreshExisting() async {
    if (state.isEmpty) return;
    final tickers = state.assets.map((a) => a.ticker).toList();
    try {
      for (final ticker in tickers) {
        final results = await _repo.search(query: ticker, limit: 5);
        if (results.isNotEmpty) _mergeList(results);
      }
    } catch (_) {
      // Silencioso — não apaga o cache existente em caso de falha
    }
  }

  // Chamado pelo ViewModel quando o backend retorna resultados de uma busca
  void addResults(List<Asset> assets) => _mergeList(assets);

  void _mergeList(List<Asset> incoming) {
    final updated = Map<String, Asset>.from(state._byId);
    for (final a in incoming) {
      updated[a.id] = a;
    }
    state = state.withAssets(updated);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
