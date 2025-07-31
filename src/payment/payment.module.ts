import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtUtils } from '../utils/auth.utils';

@Module({
  imports: [PrismaModule],
  providers: [PaymentService, JwtUtils],
  controllers: [PaymentController],
})
export class PaymentModule {}
