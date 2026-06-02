import { LoginDto } from "@auth/application/dto/login.dto";
import { AuthService } from "@auth/application/services/auth.service";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Public } from "@shared/infra/decorators/public.decorator";
import { CreateUserDto } from "@users/application/dto/create-user.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Autenticar usuario" })
  @ApiOkResponse({ description: "Token gerado" })
  @ApiUnauthorizedResponse({ description: "Credenciais invalidas" })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post("register")
  @Public()
  @ApiOperation({ summary: "Cadastrar novo usuario" })
  @ApiCreatedResponse({ description: "Usuario cadastrado" })
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }
}
