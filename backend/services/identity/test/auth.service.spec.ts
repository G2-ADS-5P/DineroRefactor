import { AuthService } from "@auth/application/services/auth.service";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { UserService } from "@users/application/services/user.service";

describe("AuthService", () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    userService = {
      validateCredentials: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it("returns token + user on valid credentials", async () => {
    userService.validateCredentials.mockResolvedValueOnce({
      id: "user-1",
      email: "user@dinero.app",
    });
    jwtService.signAsync.mockResolvedValueOnce("signed.token");
    userService.findById.mockResolvedValueOnce({
      id: "user-1",
      name: "User",
      email: "user@dinero.app",
      phone: undefined,
      birthDate: undefined,
      location: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await service.login({
      email: "user@dinero.app",
      password: "senha123",
    });

    expect(result.accessToken).toBe("signed.token");
    expect(result.user.id).toBe("user-1");
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: "user-1",
      email: "user@dinero.app",
    });
  });

  it("throws UnauthorizedException on invalid credentials", async () => {
    userService.validateCredentials.mockResolvedValueOnce(null);

    await expect(
      service.login({ email: "user@dinero.app", password: "bad" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
