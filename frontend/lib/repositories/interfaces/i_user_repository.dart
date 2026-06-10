import 'package:dinero/models/user.dart';

abstract class IUserRepository {
  Future<User> getMe();
  Future<void> updateProfile(String id, Map<String, dynamic> changes);
  Future<void> deleteAccount(String id);
}
