import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':id')
  async getPaidPayments(@Param('id') id: string) {
    return this.paymentService.getPaidPayments(id);
  }
}
