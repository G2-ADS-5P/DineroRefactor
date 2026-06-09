import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PortfolioAccessService } from "@portfolio/application/services/portfolio-access.service";
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
      throw new ForbiddenException("Authenticated user is required");
    }

    await this.portfolioAccessService.assertCanWrite(userId);
    return true;
  }
}
