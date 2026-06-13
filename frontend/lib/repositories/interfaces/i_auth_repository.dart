import 'package:dinero/models/auth_result.dart';
import 'package:dinero/models/create_user_data.dart';

abstract class IAuthRepository {
  Future<AuthResult> login(String email, String password);
  Future<AuthResult> register(CreateUserData data);
}
