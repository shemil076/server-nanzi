import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { subscribe } from 'diagnostics_channel';
import { Observable } from 'rxjs';
import { json } from 'stream/consumers';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async streamFromFastApi(message: string) {
  const response = await fetch('http://host.docker.internal:8000/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  return response.body; 
}

  async initializeConversation(userId: string) {
    try {
      const conversation = await this.prismaService.conversation.create({
        data: {
          userId: userId,
        },
      });

      return conversation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to initialize a conversation : ${message}`,
      );
    }
  }
}
