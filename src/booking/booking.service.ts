import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { NotFoundError } from 'rxjs';
import { addMonths } from 'date-fns';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(createBookingDto: CreateBookingDto) {
    try {
      const newBooking = await this.prisma.booking.create({
        data: {
          ...createBookingDto,
        },
      });

      if (newBooking) {
        await this.prisma.property.update({
          where: {
            id: newBooking.propertyId,
          },
          data: {
            status: 'PENDING',
          },
        });
      }

      return newBooking;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create a booking ' + error,
      );
    }
  }

  async getPendingBookingByTenant(tenantId: string) {
    try {
      const pendingBookingWithProperty = await this.prisma.booking.findFirst({
        where: {
          tenantId,
          status: 'PENDING',
          property: {
            status: 'PENDING',
          },
        },
        include: {
          property: {
            select: {
              title: true,
              address: true,
            },
          },
        },
      });

      return pendingBookingWithProperty;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch the booking by tenant' + error,
      );
    }
  }

  async approveBooking(bookingId: string) {
    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: { status: 'APPROVED' },
          include: { invitation: true, property: true },
        });

        if (!booking || !booking.tenantId) {
          throw new NotFoundError('Booking not found');
        }

        const newLease = await tx.lease.create({
          data: {
            propertyId: booking.propertyId,
            tenantId: booking.tenantId,
            landLordId: booking.property.landlordId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            rentAmount: booking.property.price,
          },
        });

        const nextDueDate = addMonths(newLease.startDate, 1);

        await tx.payment.create({
          data: {
            leaseId: newLease.id,
            amount: newLease.rentAmount,
            dueDate: nextDueDate,
            paidAt: null,
          },
        });

        await tx.property.update({
          where: { id: booking.propertyId },
          data: { status: 'RENTED' },
        });

        return booking;
      });

      return booking;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to approve the booking ' + error,
      );
    }
  }

  async linkBookingToTenant(bookingId: string, tenantId: string) {
    try {
      const updatedBooking = await this.prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          tenantId,
        },
      });

      return updatedBooking;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to link booking and tenant' + error,
      );
    }
  }
}
