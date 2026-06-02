import 'package:dinero/models/asset.dart';

abstract class IAssetRepository {
  Future<List<Asset>> getAll();
  Future<Asset?> getById(String id);
}
