import 'dart:async';

import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AssetCacheState {
  final Map<String, Asset> _byId;
  final bool isReady;

  const AssetCacheState({Map<String, Asset>? byId, this.isReady = false})
      : _byId = byId ?? const {};

  List<Asset> get assets => _byId.values.toList();

  AssetCacheState copyWith({Map<String, Asset>? byId, bool? isReady}) =>
      AssetCacheState(
        byId: byId ?? _byId,
        isReady: isReady ?? this.isReady,
      );
}

class AssetCacheNotifier extends StateNotifier<AssetCacheState> {
  final IAssetRepository _repo;
  Timer? _timer;

  AssetCacheNotifier(this._repo) : super(const AssetCacheState()) {
    _init();
  }

  // Chamado uma vez no boot — popula o cache com a primeira página
  Future<void> _init() async {
    await _refresh();
    _timer = Timer.periodic(const Duration(minutes: 5), (_) => _refresh());
  }

  // Busca a primeira página do catálogo (sem query → preços do banco, mais rápido)
  Future<void> _refresh() async {
    try {
      final assets = await _repo.search(limit: 20);
      _merge(assets, markReady: true);
    } catch (_) {
      // Não travar — apenas marca como pronto mesmo sem dados
      if (!state.isReady) {
        state = state.copyWith(isReady: true);
      }
    }
  }

  // Adiciona resultados de uma busca específica ao cache (cresce com o uso)
  void addResults(List<Asset> assets) => _merge(assets);

  void _merge(List<Asset> incoming, {bool markReady = false}) {
    final map = Map<String, Asset>.from(state._byId);
    for (final a in incoming) {
      map[a.id] = a;
    }
    state = state.copyWith(byId: map, isReady: markReady || state.isReady);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
