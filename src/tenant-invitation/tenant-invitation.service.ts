import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantInvitationDto } from './dto/create-invitation.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { formatToShortDate } from '../utils/helper-functions';
import { PropertyService } from '../property/property.service';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { BookingService } from '../booking/booking.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class TenantInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly propertyService: PropertyService,
    private readonly configService: ConfigService,
    private readonly bookingService: BookingService,
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
          jti: randomUUID(),
          email: dto.email,
          bookingId: pendingBooking.id,
          createdAt: Date.now(),
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
          baseUrl: this.configService.get<string>('BASE_URL'),
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

  async verifyInvitationToken(token: string) {
    try {
      this.jwtService.verify(token) as unknown as string;

      const invitation = await this.prisma.tenantInvitation.findUnique({
        where: { token },
        include: {
          booking: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!invitation) throw new NotFoundException('Invitation not found');
      if (invitation.status === 'ACCEPTED')
        throw new BadRequestException('Already accepted');
      if (invitation.expiresAt < new Date())
        throw new BadRequestException('Invitation expired');

      return invitation;
    } catch (error) {
      console.log('Error =>>', error);
      throw new InternalServerErrorException(
        'Failed to verify invitation token' + error,
      );
    }
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    try {
      const invitation = await this.prisma.tenantInvitation.findUnique({
        where: {
          id: dto.invitationId,
        },
        include: {
          booking: true,
        },
      });
      if (!invitation) throw new NotFoundException('Invitation not found');
      if (invitation.status === 'ACCEPTED')
        throw new BadRequestException('Already accepted');
      if (invitation.expiresAt < new Date())
        throw new BadRequestException('Invitation expired');

      const createUserDto: RegisterUserDto = {
        email: invitation.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'TENANT',
        password: dto.password,
      };
      const createdUser =
        await this.userService.createTenantViaInvitation(createUserDto);

      await this.updateInvitationsStatus(invitation.id, 'ACCEPTED');

      if (invitation.booking) {
        const updatedBooking = await this.bookingService.linkBookingToTenant(
          invitation.booking?.id,
          createdUser.id,
        );
      }
      return { accepted: true };
    } catch (error) {
      console.log('Error =>>', error);
      throw new InternalServerErrorException(
        'Failed to accept the invitation' + error,
      );
    }
  }

  private async updateInvitationsStatus(
    invitationId: string,
    status: InvitationStatus,
  ) {
    try {
      const updatedInvitation = this.prisma.tenantInvitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status,
        },
      });

      return updatedInvitation;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update the invitation status' + error,
      );
    }
  }
}
