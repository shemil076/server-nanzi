import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtUtils } from '../utils/auth.utils';

@Module({
  imports: [PrismaModule],
  providers: [TenantService, JwtUtils],
  controllers: [TenantController],
})
export class TenantModule {}
