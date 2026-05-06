import { ClassOfferingModule } from "@class-offering/class-offering.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    ClassOfferingModule,
  ],
})
export class AppModule {}
