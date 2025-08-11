import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { BookingService } from './booking.service';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { User } from '../auth/user.decorator';
import { UserPayload } from '../types/auth';

@Controller('booking')
@UseGuards(JwtAuthGuard, RoleGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @Roles(Role.LANDLORD)
  async create(@Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto);
  }

  @Get('pending-booking')
  @Roles(Role.TENANT)
  async getPendingBooking(@User() user: UserPayload) {
    return this.bookingService.getPendingBookingByTenant(user.id);
  }

  @Patch('approve-booking/:id')
  @Roles(Role.TENANT)
  async approveBooking(@Param('id') id: string) {
    return this.bookingService.approveBooking(id);
  }
}
