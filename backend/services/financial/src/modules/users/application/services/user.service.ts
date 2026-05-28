import { Inject, Injectable } from "@nestjs/common";
import type { UserEventDto } from "@users/application/dto/user-event.dto";
import { User } from "@users/domain/models/user.entity";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "@users/domain/repositories/user-repository.interface";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async ensureLocalUser(externalId: string): Promise<User> {
    const existing = await this.userRepository.findByExternalId(externalId);
    if (existing) return existing;

    const stub = User.restore({
      externalId,
      name: "pending",
      email: "pending",
    })!;
    await this.userRepository.create(stub);

    return (await this.userRepository.findByExternalId(externalId))!;
  }

  async upsertFromIdentity(payload: UserEventDto): Promise<void> {
    const existing = await this.userRepository.findByExternalId(payload.id);

    if (existing) {
      existing.withName(payload.name).withEmail(payload.email);
      await this.userRepository.update(existing);
      return;
    }

    const user = User.restore({
      externalId: payload.id,
      name: payload.name,
      email: payload.email,
    })!;
    await this.userRepository.create(user);
  }

  async removeByExternalId(externalId: string): Promise<void> {
    const existing = await this.userRepository.findByExternalId(externalId);
    if (!existing) return;
    await this.userRepository.delete(existing.id!);
  }
}
