import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PortfolioModule } from "@portfolio/portfolio.module";
import { SharedModule } from "@shared/shared.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    PortfolioModule,
  ],
})
export class AppModule {}
