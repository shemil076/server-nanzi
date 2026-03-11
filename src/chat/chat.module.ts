import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtUtils } from '../utils/auth.utils';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ChatController],
  providers: [ChatService, JwtUtils]
})
export class ChatModule {}
