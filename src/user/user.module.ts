import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtUtils } from '../utils/auth.utils';

@Module({
  imports: [PrismaModule],
  providers: [UserService, JwtUtils],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
