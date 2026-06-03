import 'package:dinero/core/constants/mock_data.dart';
import 'package:dinero/models/asset.dart';
import 'package:dinero/repositories/interfaces/i_asset_repository.dart';

class MockAssetRepository implements IAssetRepository {
  @override
  Future<List<Asset>> getAll() async => MockData.assets;

  @override
  Future<Asset?> getById(String id) async {
    try {
      return MockData.assets.firstWhere((a) => a.id == id);
    } catch (_) {
      return null;
    }
  }
}
