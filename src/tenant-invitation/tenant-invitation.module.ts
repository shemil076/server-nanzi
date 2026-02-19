import { Module } from '@nestjs/common';
import { TenantInvitationService } from './tenant-invitation.service';
import { TenantInvitationController } from './tenant-invitation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtUtils } from '../utils/auth.utils';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { PropertyModule } from '../property/property.module';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [
    MailModule,
    PrismaModule,
    ConfigModule,
    UserModule,
    PropertyModule,
    BookingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TenantInvitationService, JwtUtils],
  controllers: [TenantInvitationController],
})
export class TenantInvitationModule {}
