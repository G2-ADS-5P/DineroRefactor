import type { LoginDto } from "@auth/application/dto/login.dto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "@users/application/services/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.userService.validateCredentials(
      dto.email,
      dto.password,
    );

    if (!user) throw new UnauthorizedException("Invalid credentials");

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      permissions: user.permissions,
    });

    return { accessToken };
  }
}
