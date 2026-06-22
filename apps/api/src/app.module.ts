import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { KycModule } from "./modules/kyc/kyc.module";
import { LoanModule } from "./modules/loan/loan.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { LenderModule } from "./modules/lender/lender.module";
import { AdminModule } from "./modules/admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env", ".env.local"],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    KycModule,
    LoanModule,
    PaymentModule,
    NotificationModule,
    LenderModule,
    AdminModule,
  ],
})
export class AppModule {}
