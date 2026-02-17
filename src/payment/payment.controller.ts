import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';
import { UserPayload } from '../types/auth';
import { User } from '../auth/user.decorator';
import { NewInstallmentDto } from '../installment/dto/new-installment.dto';
import { DeleteInstallmentDto } from './dto/delete-installment.dto';

@Controller('payment')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('tenant/:propertyId')
  @Roles(Role.TENANT)
  async getTenantsPayments(
    @User() user: UserPayload,
    @Param('propertyId') propertyId: string,
  ) {
    return this.paymentService.getCurrentTenantsPayments(user.id, propertyId);
  }

  @Get(':id')
  @Roles(Role.LANDLORD)
  async getPaidPayments(@Param('id') id: string) {
    return this.paymentService.getPaidPayments(id);
  }

  @Get('current/:propertyId')
  @Roles(Role.TENANT)
  async getCurrentMonthPayment(
    @User() user: UserPayload,
    @Param('propertyId') propertyId: string,
  ) {
    return this.paymentService.getThisMonthRentPayment(user.id, propertyId);
  }

  @Post('full-payment')
  @Roles(Role.TENANT)
  async payFullPayment(@Body() dto: NewInstallmentDto) {
    return this.paymentService.payFullPayment(dto);
  }

  @Post('installment')
  @Roles(Role.TENANT)
  async payInstallmentPayment(@Body() dto: NewInstallmentDto) {
    return this.paymentService.payInstallment(dto);
  }

  @Delete(':paymentId/installment/:installmentId')
  @Roles(Role.TENANT)
  removeInstallment(@Param() deleteInstallmentDto: DeleteInstallmentDto) {
    return this.paymentService.deleteInstallmentAndUpdatePayment(
      deleteInstallmentDto,
    );
  }
}
