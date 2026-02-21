import { Controller, Param, Post, Query, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Sse('stream')
    stream(@Query('message') message: string): Observable<MessageEvent> {
    return this.chatService.streamFromFastApi(message);
  }

  @Post('new/:userId')
    async initializeNewConversation(@Param('userId')userId: string) {
      return this.chatService.initializeConversation(userId);
    }
}
