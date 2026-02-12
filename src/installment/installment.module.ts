import { Module } from '@nestjs/common';
import { InstallmentService } from './installment.service';
import { InstallmentController } from './installment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtUtils } from '../utils/auth.utils';

@Module({
  imports: [PrismaModule],
  providers: [InstallmentService, JwtUtils],
  controllers: [InstallmentController],
  exports: [InstallmentService],
})
export class InstallmentModule {}
