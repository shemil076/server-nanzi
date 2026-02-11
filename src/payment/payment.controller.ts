import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';
import { UserPayload } from '../types/auth';
import { User } from '../auth/user.decorator';

@Controller('payment')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('tenant/:propertyId')
  @Roles(Role.TENANT)
  async getTenantsPayments() {
    // @Param('propertyId') propertyId: string, // @User() user: UserPayload,
    return this.paymentService.getCurrentTenantsPayments();
  }

  @Get(':id')
  @Roles(Role.LANDLORD)
  async getPaidPayments() {
    return this.paymentService.getPaidPayments();
  }
}
