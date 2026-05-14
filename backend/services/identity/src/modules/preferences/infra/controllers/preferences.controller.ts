import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PreferenceResponseDto } from "@preferences/application/dto/preference-response.dto";
import { UpdateCurrencyDto } from "@preferences/application/dto/update-currency.dto";
import { PreferenceService } from "@preferences/application/services/preference.service";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { HateoasItem } from "@shared/infra/hateoas";

@ApiTags("preferences")
@ApiBearerAuth()
@Controller("preferences")
export class PreferencesController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get("me")
  @ApiOperation({ summary: "Preferencias do usuario autenticado" })
  @HateoasItem<PreferenceResponseDto>({
    basePath: "/v1/preferences",
    itemLinks: () => ({
      self: { href: "/v1/preferences/me", method: "GET" },
      updateCurrency: { href: "/v1/preferences/currency", method: "PUT" },
    }),
  })
  async findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.preferenceService.getByUserId(user.sub);
  }

  @Put("currency")
  @ApiOperation({ summary: "Atualizar moeda padrao" })
  async updateCurrency(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateCurrencyDto,
  ) {
    return this.preferenceService.updateCurrency(user.sub, body.currency);
  }
}
