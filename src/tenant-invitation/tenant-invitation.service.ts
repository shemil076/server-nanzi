import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantInvitationDto } from './dto/create-invitation.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TenantInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createTenantInvitation(dto: CreateTenantInvitationDto) {
    try {
      console.log('start running');
      const pendingBooking = await this.prisma.booking.create({
        data: {
          propertyId: dto.propertyId,
          startDate: dto.startDate,
        },
      });

      console.log('pendingBooking =>', pendingBooking);
      const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

      // const payLoad = {
      //   email: dto.email,
      //   bookingId: pendingBooking.id,
      //   exp: '7d',
      // };
      // console.log('payLoad =>', payLoad);
      const invitationToken = this.jwtService.sign(
        {
          email: dto.email,
          bookingId: pendingBooking.id,
        },
        { expiresIn: '7d' }, // Let JwtService calculate exp
      );

      console.log('invitationToken =>', invitationToken);

      const invitation = await this.prisma.tenantInvitation.create({
        data: {
          email: dto.email,
          propertyId: dto.propertyId,
          token: invitationToken,
          expiresAt: new Date(expirationTime * 1000),
        },
      });

      console.log('invitation =>', invitation);
      await this.prisma.booking.update({
        where: {
          id: pendingBooking.id,
        },
        data: {
          invitationId: invitation.id,
        },
      });

      await this.mailService.sendTenantInvitation(
        dto.email,
        'Tenant invitation',
        'invitation',
        {
          propertyId: dto.propertyId,
          startDate: dto.startDate,
          token: invitationToken,
        },
      );

      console.log('Email sent');

      return 'Email sent';
    } catch (error) {
      console.log('Error =>>', error);
      throw new InternalServerErrorException(
        "Failed to create the tenant's invitation" + error,
      );
    }
  }
}
