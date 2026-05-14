import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PreferenceService } from "@preferences/application/services/preference.service";
import { CreateUserDto } from "@users/application/dto/create-user.dto";
import { UserMessagingService } from "@users/application/services/user-messaging.service";
import { UserService } from "@users/application/services/user.service";
import { User } from "@users/domain/models/user.entity";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "@users/domain/repositories/user-repository.interface";
import bcrypt from "bcryptjs";

describe("UserService", () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let messaging: jest.Mocked<UserMessagingService>;
  let preferences: jest.Mocked<PreferenceService>;

  beforeEach(async () => {
    userRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    messaging = {
      publishUserCreated: jest.fn(),
      publishUserUpdated: jest.fn(),
      publishUserDeleted: jest.fn(),
      onApplicationBootstrap: jest.fn(),
    } as unknown as jest.Mocked<UserMessagingService>;

    preferences = {
      createDefault: jest.fn(),
      getByUserId: jest.fn(),
      updateCurrency: jest.fn(),
    } as unknown as jest.Mocked<PreferenceService>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: UserMessagingService, useValue: messaging },
        { provide: PreferenceService, useValue: preferences },
      ],
    }).compile();

    service = moduleRef.get(UserService);
  });

  const dto: CreateUserDto = {
    name: "John Doe",
    email: "John@Dinero.app",
    password: "senha123",
  };

  it("creates a user, publishes USER_CREATED, and seeds default preference", async () => {
    userRepository.findByEmail.mockResolvedValueOnce(null);
    const stored = User.restore({
      id: "user-1",
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userRepository.findByEmail.mockResolvedValueOnce(stored);

    const result = await service.create(dto);

    expect(result.id).toBe("user-1");
    expect(result.email).toBe("john@dinero.app");
    expect(userRepository.create).toHaveBeenCalledTimes(1);
    expect(preferences.createDefault).toHaveBeenCalledWith("user-1");
    expect(messaging.publishUserCreated).toHaveBeenCalledTimes(1);
  });

  it("rejects duplicated email", async () => {
    userRepository.findByEmail.mockResolvedValueOnce(
      User.restore({
        id: "existing",
        name: "x",
        email: "john@dinero.app",
        password: "h",
      }),
    );

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(messaging.publishUserCreated).not.toHaveBeenCalled();
  });

  it("edits a user and publishes USER_UPDATED", async () => {
    const existing = User.restore({
      id: "user-1",
      name: "Old",
      email: "user@dinero.app",
      password: "h",
    })!;
    const updated = User.restore({
      id: "user-1",
      name: "New",
      email: "user@dinero.app",
      password: "h",
    });
    userRepository.findById
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(updated);

    const result = await service.edit("user-1", { name: "New" });

    expect(result.name).toBe("New");
    expect(userRepository.update).toHaveBeenCalledTimes(1);
    expect(messaging.publishUserUpdated).toHaveBeenCalledTimes(1);
  });

  it("throws NotFoundException when editing missing user", async () => {
    userRepository.findById.mockResolvedValueOnce(null);
    await expect(service.edit("missing", { name: "x" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(messaging.publishUserUpdated).not.toHaveBeenCalled();
  });

  it("removes a user and publishes USER_DELETED", async () => {
    const existing = User.restore({
      id: "user-1",
      name: "X",
      email: "x@dinero.app",
      password: "h",
    });
    userRepository.findById.mockResolvedValueOnce(existing);

    await service.remove("user-1");

    expect(userRepository.delete).toHaveBeenCalledWith("user-1");
    expect(messaging.publishUserDeleted).toHaveBeenCalledTimes(1);
  });

  it("validates correct credentials", async () => {
    const password = "senha123";
    const hashed = await bcrypt.hash(password, 4);
    userRepository.findByEmail.mockResolvedValueOnce(
      User.restore({
        id: "user-1",
        name: "X",
        email: "x@dinero.app",
        password: hashed,
      }),
    );

    const result = await service.validateCredentials("X@dinero.app", password);

    expect(result).toEqual({ id: "user-1", email: "x@dinero.app" });
  });

  it("returns null for wrong password", async () => {
    const hashed = await bcrypt.hash("right", 4);
    userRepository.findByEmail.mockResolvedValueOnce(
      User.restore({
        id: "user-1",
        name: "X",
        email: "x@dinero.app",
        password: hashed,
      }),
    );

    const result = await service.validateCredentials(
      "x@dinero.app",
      "wrong-password",
    );
    expect(result).toBeNull();
  });

  it("returns null when user does not exist", async () => {
    userRepository.findByEmail.mockResolvedValueOnce(null);
    const result = await service.validateCredentials(
      "ghost@dinero.app",
      "any",
    );
    expect(result).toBeNull();
  });
});
