import { AuthModule } from "@auth/auth.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PreferencesModule } from "@preferences/preferences.module";
import { SharedModule } from "@shared/shared.module";
import { SubscriptionsModule } from "@subscriptions/subscriptions.module";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    SharedModule,
    UsersModule,
    AuthModule,
    PreferencesModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
