import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

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

      return newBooking;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create a booking ' + error,
      );
    }
  }
}
