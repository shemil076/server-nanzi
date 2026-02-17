import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { InstallmentService } from './installment.service';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';

@Controller('installment')
@UseGuards(JwtAuthGuard, RoleGuard)
export class InstallmentController {
  constructor(private readonly installmentService: InstallmentService) {}

  @Get('all/:id')
  @Roles(Role.TENANT)
  async getInstallmentsByPayment(@Param('id') id: string) {
    return this.installmentService.fetchInstallmentByPaymentId(id);
  }
}
