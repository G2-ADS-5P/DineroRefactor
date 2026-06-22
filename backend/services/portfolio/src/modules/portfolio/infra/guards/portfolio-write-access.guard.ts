import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PortfolioAccessService } from "@portfolio/application/services/portfolio-access.service";
import { AuthenticatedUserRequiredError } from "@portfolio/domain/errors/portfolio.errors";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";

@Injectable()
export class PortfolioWriteAccessGuard implements CanActivate {
  constructor(
    private readonly portfolioAccessService: PortfolioAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new AuthenticatedUserRequiredError();
    }

    await this.portfolioAccessService.assertCanWrite(userId);
    return true;
  }
}
