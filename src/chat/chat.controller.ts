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

@Controller('chat')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('stream')
  async stream(
    @Body('message') message: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await this.chatService.streamFromFastApi(message);

    if (!stream) {
      throw new Error('No stream returned from FastAPI');
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      res.write(chunk);
    }

    res.end();
  }

  @Post('new')
  async initializeNewConversation(@User() user: UserPayload) {
    return this.chatService.initializeConversation(user.id);
  }
}
