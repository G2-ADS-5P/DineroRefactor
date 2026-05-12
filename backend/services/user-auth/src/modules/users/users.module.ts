import { Module } from "@nestjs/common";
import { TeacherMessageConsumerService } from "@users/application/services/teacher-message-consumer.service";
import { UserService } from "@users/application/services/user.service";
import { USER_REPOSITORY } from "@users/domain/repositories/user-repository.interface";
import { UsersController } from "@users/infra/controllers/users.controller";
import { DrizzleTeacherRepository } from "@users/infra/repositories/drizzle-teacher.repository";
import { DrizzleUserRepository } from "@users/infra/repositories/drizzle-user.repository";

@Module({
  controllers: [UsersController],
  providers: [
    TeacherMessageConsumerService,
    UserService,
    DrizzleTeacherRepository,
    DrizzleUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: DrizzleUserRepository,
    },
  ],
  exports: [UserService],
})
export class UsersModule {}
