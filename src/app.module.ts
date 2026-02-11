import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PropertyModule } from './property/property.module';
import { PaymentModule } from './payment/payment.module';
import { IssueModule } from './issue/issue.module';
import { TenantModule } from './tenant/tenant.module';
import { BookingModule } from './booking/booking.module';
import { TenantInvitationModule } from './tenant-invitation/tenant-invitation.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentService } from './payment/payment.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    PropertyModule,
    PaymentModule,
    IssueModule,
    TenantModule,
    BookingModule,
    TenantInvitationModule,
    MailModule,
    UserModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, PaymentService],
})
export class AppModule {}
