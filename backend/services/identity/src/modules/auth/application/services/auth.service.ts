import { LoginDto } from "@auth/application/dto/login.dto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "@users/application/dto/create-user.dto";
import { UserResponseDto } from "@users/application/dto/user-response.dto";
import { UserService } from "@users/application/services/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; user: UserResponseDto }> {
    const payload = await this.userService.validateCredentials(
      dto.email,
      dto.password,
    );

    if (!payload) throw new UnauthorizedException("Invalid credentials");

    const accessToken = await this.jwtService.signAsync({
      sub: payload.id,
      email: payload.email,
    });

    const user = await this.userService.findById(payload.id);

    return { accessToken, user };
  }

  async register(
    dto: CreateUserDto,
  ): Promise<{ accessToken: string; user: UserResponseDto }> {
    const user = await this.userService.create(dto);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken, user };
  }
}
