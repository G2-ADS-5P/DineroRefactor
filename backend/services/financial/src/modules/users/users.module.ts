import { Module } from "@nestjs/common";
import { UserService } from "@users/application/services/user.service";
import { UserMessageConsumerService } from "@users/application/services/user-message-consumer.service";
import { USER_REPOSITORY } from "@users/domain/repositories/user-repository.interface";
import { DrizzleUserRepository } from "@users/infra/repositories/drizzle-user.repository";

@Module({
  providers: [
    UserService,
    UserMessageConsumerService,
    DrizzleUserRepository,
    { provide: USER_REPOSITORY, useExisting: DrizzleUserRepository },
  ],
  exports: [UserService],
})
export class UsersModule {}
