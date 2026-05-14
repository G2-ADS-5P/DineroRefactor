import { forwardRef, Module } from "@nestjs/common";
import { PreferencesModule } from "@preferences/preferences.module";
import { UserMessagingService } from "@users/application/services/user-messaging.service";
import { UserService } from "@users/application/services/user.service";
import { USER_REPOSITORY } from "@users/domain/repositories/user-repository.interface";
import { UsersController } from "@users/infra/controllers/users.controller";
import { DrizzleUserRepository } from "@users/infra/repositories/drizzle-user.repository";

@Module({
  imports: [forwardRef(() => PreferencesModule)],
  controllers: [UsersController],
  providers: [
    UserService,
    UserMessagingService,
    DrizzleUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: DrizzleUserRepository,
    },
  ],
  exports: [UserService],
})
export class UsersModule {}
