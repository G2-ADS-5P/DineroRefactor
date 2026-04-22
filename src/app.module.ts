import { AcademicModule } from "@academic/academic.module";
import { AttendanceModule } from "@attendance/attendance.module";
import { AuthModule } from "@auth/auth.module";
import { ClassOfferingModule } from "@class-offering/class-offering.module";
import { EnrollmentModule } from "@enrollment/enrollment.module";
import { MessagingModule } from "@messaging/messaging.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    SharedModule,
    MessagingModule,
    AcademicModule,
    AttendanceModule,
    ClassOfferingModule,
    EnrollmentModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
