import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { subscribe } from 'diagnostics_channel';
import { Observable } from 'rxjs';
import { json } from 'stream/consumers';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';
import { RedisService } from '../redis/redis.service';
import { Message } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    private redisService: RedisService,
  ) {}

  async streamFromFastApi(
    conversationId: string,
    message: string,
    res: Response,
  ) {
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message,
      createdAt: new Date(),
      conversationId: conversationId,
    };

    const history = await this.redisService.getMessages(conversationId);

    const response = await fetch(
      'http://host.docker.internal:8000/chat/stream',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      },
    );
    if (!response.body) {
      throw new Error('No stream returned from FastAPI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantFullText: string[] = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      if (chunk === '[DONE]') continue;

      try {
        const jsonString = chunk.replace(/^data:\s*/, '');
        const parsed = JSON.parse(jsonString);

        assistantFullText.push(parsed.content);

        res.write(chunk);
      } catch (e) {
        console.warn('Skipping invalid JSON:', chunk);
      }
    }

    await this.redisService.saveNewMessage(conversationId, userMessage);
    
    const cleanedText = assistantFullText
      .map((word) => word.trim().replace(/,$/, ''))
      .join(' ');

    await this.redisService.saveNewMessage(conversationId, {
      id: uuidv4(),
      role: 'assistant',
      content: cleanedText,
      createdAt: new Date(),
      conversationId,
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

      await this.redisService.saveConversation(conversation.id, conversation);

      return conversation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to initialize a conversation : ${message}`,
      );
    }
  }
}
