import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtUtils } from '../utils/auth.utils';
import { InstallmentModule } from '../installment/installment.module';

@Module({
  imports: [PrismaModule, InstallmentModule],
  providers: [PaymentService, JwtUtils],
  controllers: [PaymentController],
})
export class PaymentModule {}
