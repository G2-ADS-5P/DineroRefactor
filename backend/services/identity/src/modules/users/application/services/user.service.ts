import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import { CreateUserDto } from "@users/application/dto/create-user.dto";
import { UpdateUserDto } from "@users/application/dto/update-user.dto";
import { UserPayload } from "@users/application/dto/user-payload.interface";
import { UserResponseDto } from "@users/application/dto/user-response.dto";
import { User } from "@users/domain/models/user.entity";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "@users/domain/repositories/user-repository.interface";
import { UserMessagingService } from "@users/application/services/user-messaging.service";
import bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly userMessagingService: UserMessagingService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const email = dto.email.toLowerCase();
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new ConflictException("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = User.restore({
      name: dto.name,
      email,
      password: hashedPassword,
      phone: dto.phone,
      birthDate: dto.birthDate,
      location: dto.location,
    })!;

    await this.userRepository.create(user);

    const created = await this.userRepository.findByEmail(email);
    const response = UserResponseDto.from(created)!;
    await this.userMessagingService.publishUserCreated(response);
    return response;
  }

  async edit(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("User not found");

    if (dto.name !== undefined) user.withName(dto.name);
    if (dto.phone !== undefined) user.withPhone(dto.phone);
    if (dto.birthDate !== undefined) user.withBirthDate(dto.birthDate);
    if (dto.location !== undefined) user.withLocation(dto.location);

    await this.userRepository.update(user);

    const updated = await this.userRepository.findById(id);
    const response = UserResponseDto.from(updated)!;
    await this.userMessagingService.publishUserUpdated(response);
    return response;
  }

  async remove(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("User not found");

    const response = UserResponseDto.from(user)!;
    await this.userRepository.delete(id);
    await this.userMessagingService.publishUserDeleted(response);
    return response;
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return UserResponseDto.from(user)!;
  }

  async listPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const { rows, total } = await this.userRepository.findAllPaginated(params);
    return {
      data: rows.map((u) => UserResponseDto.from(u)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<UserPayload | null> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    return { id: user.id!, email: user.email };
  }
}
