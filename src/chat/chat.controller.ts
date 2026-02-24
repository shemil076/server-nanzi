import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  Req,
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { User } from '../auth/user.decorator';
import { UserPayload } from '../types/auth';
import { Response, Request } from 'express';
import { RedisService } from '../redis/redis.service';
import { Message } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Controller('chat')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private redisService: RedisService,
  ) {}

  @Post('stream/:conversationId')
  async stream(
    @Body('message') message: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('conversationId') conversationId: string,
  ) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await this.chatService.streamFromFastApi(
    conversationId,
    message,
    res,
  );

  res.end();
  }

  @Post('new')
  async initializeNewConversation(@User() user: UserPayload) {
    return this.chatService.initializeConversation(user.id);
  }
}
