import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantInvitation } from './dto/create-invitation.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createTenantInvitation(dto: CreateTenantInvitation) {
    try {
      const pendingBooking = await this.prisma.booking.create({
        data: {
          propertyId: dto.propertyId,
          startDate: dto.startDate,
        },
      });

      const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

      const payLoad = {
        email: dto.email,
        bookingId: pendingBooking.id,
        exp: expirationTime,
      };

      const invitationToken = this.jwtService.sign(payLoad);

      const invitation = await this.prisma.tenantInvitation.create({
        data: {
          email: dto.email,
          propertyId: dto.propertyId,
          token: invitationToken,
          expiresAt: new Date(expirationTime * 1000),
        },
      });

      await this.prisma.booking.update({
        where: {
          id: pendingBooking.id,
        },
        data: {
          invitationId: invitation.id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to create the tenant's invitation" + error,
      );
    }
  }
}
