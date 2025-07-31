import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtUtils } from '../utils/auth.utils';

@Module({
  imports: [PrismaModule],
  providers: [PropertyService, JwtUtils],
  controllers: [PropertyController],
})
export class PropertyModule {}
