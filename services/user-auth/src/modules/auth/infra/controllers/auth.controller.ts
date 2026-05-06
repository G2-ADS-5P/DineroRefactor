import { LoginDto } from "@auth/application/dto/login.dto";
import { AuthService } from "@auth/application/services/auth.service";
import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Public } from "@shared/infra/decorators/public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Public()
  @ApiOperation({ summary: "Autenticar usuário" })
  @ApiUnauthorizedResponse({ description: "Credenciais inválidas" })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
