import { AuthService } from "@auth/application/services/auth.service";
import { AuthController } from "@auth/infra/controllers/auth.controller";
import { Module } from "@nestjs/common";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
