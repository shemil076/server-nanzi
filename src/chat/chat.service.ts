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
      role: 'USER',
      type: 'TEXT',
      content: null,
      createdAt: new Date(),
      conversationId: conversationId,
      metadata: {
        content: message,
      },
    };

    // Saving the user's message
    await this.redisService.saveNewMessage(conversationId, userMessage);

    const history = await this.redisService.getMessages(conversationId);

    const historyArray = history.map(({ metadata, role }) => ({
      role,
      content: (metadata as { content: string })?.content ?? '',
      node_id: (metadata as { node_id: string })?.node_id ?? null,
    }));

    const response = await fetch(
      'http://host.docker.internal:8000/chat/stream',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyArray }),
      },
    );
    if (!response.body) {
      throw new Error('No stream returned from FastAPI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantFullText: string[] = [];
    // let isChucksTypeText: boolean[] = [];
    let parsedItemsArray: any[] = [];

    // while (true) {
    //   const { done, value } = await reader.read();

    //   if (done) break;

    //   const chunk = decoder.decode(value);

    //   if (chunk === '[DONE]') continue;

    //   try {
    //     const jsonString = chunk.replace(/^data:\s*/, '');
    //     const parsed = JSON.parse(jsonString);

    //     const { event, type, payload } = parsed;

    //     parsedItemsArray.push(parsed);

    //     isChucksTypeText.push(type === 'TEXT');
    //     if (type === 'TEXT') {
    //       assistantFullText.push(payload.content);
    //     }

    //     res.write(chunk);
    //   } catch (e) {
    //     console.warn('Skipping invalid JSON:', chunk);
    //   }
    // }

    // if (assistantFullText.length > 2) {
    //   if (isChucksTypeText.every((item) => item == true)) {
    //     const cleanedText = assistantFullText
    //       .map((word) => word.trim().replace(/,$/, ''))
    //       .join(' ');

    //     // Saving the assistant's message
    //     await this.redisService.saveNewMessage(conversationId, {
    //       id: uuidv4(),
    //       role: 'ASSISTANT',
    //       content: null,
    //       createdAt: new Date(),
    //       conversationId,
    //       metadata: {
    //         content: cleanedText,
    //       },
    //       type: 'TEXT',
    //     });
    //   }
    // } else {
    //   parsedItemsArray.map(async ({ type, payload }) => {
    //     if (type === 'TEXT') {
    //       await this.redisService.saveNewMessage(conversationId, {
    //         id: uuidv4(),
    //         role: 'ASSISTANT',
    //         content: null,
    //         createdAt: new Date(),
    //         conversationId,
    //         metadata: {
    //           content: payload.content,
    //         },
    //         type: 'TEXT',
    //       });
    //     } else {
    //       await this.redisService.saveNewMessage(conversationId, {
    //         id: uuidv4(),
    //         role: 'ASSISTANT',
    //         content: null,
    //         createdAt: new Date(),
    //         conversationId,
    //         metadata: {
    //           chips: payload.chips,
    //           node_id: payload.node_id,
    //         },
    //         type: 'CHIP_RESPONSE',
    //       });
    //     }
    //   });
    // }

    // const cleanedText = assistantFullText
    //   .map((word) => word.trim().replace(/,$/, ''))
    //   .join(' ');

    // // Saving the assistant's message
    // await this.redisService.saveNewMessage(conversationId, {
    //   id: uuidv4(),
    //   role: 'ASSISTANT',
    //   content: null,
    //   createdAt: new Date(),
    //   conversationId,
    //   metadata: null,
    //   type: 'TEXT',
    // });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const event = chunk.split(/\n\n/);

      for (const eventString of event) {
        if (!eventString.trim()) continue;

        const jsonString = eventString.replace(/^data:\s*/, '').trim();      
        if (jsonString === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonString);
          const { type, payload } = parsed;

          parsedItemsArray.push(parsed);

          if (type === 'TEXT') {
            assistantFullText.push(payload.content);
          }
          res.write(eventString + '\n\n');
        } catch (e) {
          console.warn('Skipping invalid JSON:', eventString);
        }
      }
    }


    if(assistantFullText.length > 0) {
      const cleanedText = assistantFullText.map(word => word.trim().replace(/,$/, '')).join(' ')

      await this.redisService.saveNewMessage(conversationId, {
        id: uuidv4(),
      role: 'ASSISTANT',
      content: null,
      createdAt: new Date(),
      conversationId,
      metadata: { content: cleanedText },
      type: 'TEXT',
      })
    }


    for (const item of parsedItemsArray) {
      if (item.type == 'CHIP_RESPONSE') {
        await this.redisService.saveNewMessage(conversationId, {
          id: uuidv4(),
          role: 'ASSISTANT',
          content: null,
          createdAt: new Date(),
          conversationId,
          metadata: {
            chips: item.payload.chips,
            node_id: item.payload.node_id,
          },
          type: 'CHIP_RESPONSE',
        });
      }
    }

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

      return conversation.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to initialize a conversation : ${message}`,
      );
    }
  }
}
