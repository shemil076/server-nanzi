import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { BookingService } from './booking.service';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('booking')
@UseGuards(JwtAuthGuard, RoleGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @Roles(Role.LANDLORD)
  async create(@Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
  }
}
