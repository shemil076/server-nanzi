import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantInvitationDto } from './dto/create-invitation.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { formatToShortDate } from '../utils/helper-functions';
import { PropertyService } from '../property/property.service';

@Injectable()
export class TenantInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly propertyService: PropertyService,
  ) {}

  async createTenantInvitation(
    dto: CreateTenantInvitationDto,
    landLordId: string,
  ) {
    try {
      console.log('start running');
      const pendingBooking = await this.prisma.booking.create({
        data: {
          propertyId: dto.propertyId,
          startDate: dto.startDate,
        },
      });

      const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

      const invitationToken = this.jwtService.sign(
        {
          email: dto.email,
          bookingId: pendingBooking.id,
        },
        { expiresIn: '7d' }, // Let JwtService calculate exp
      );

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

      const user = await this.userService.getUserDetails(landLordId);
      const property = await this.propertyService.getPropertyById(
        dto.propertyId,
      );

      await this.mailService.sendTenantInvitation(
        dto.email,
        'Tenant invitation',
        'invitation',
        {
          propertyId: dto.propertyId,
          startDate: formatToShortDate(dto.startDate),
          token: invitationToken,
        },
        true,
      );

      if (user) {
        await this.mailService.sendTenantInvitation(
          user.email,
          'Landlord confirmation',
          'confirmation',
          {
            landlordName: `${user.firstName} ${user.lastName}`,
            propertyAddress: property?.address,
            tenantEmail: dto.email,
            notificationDate: formatToShortDate(new Date(Date.now())),
          },
          false,
        );
      }

      return 'Email sent';
    } catch (error) {
      console.log('Error =>>', error);
      throw new InternalServerErrorException(
        "Failed to create the tenant's invitation" + error,
      );
    }
  }
}
