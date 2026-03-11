import { Inject, Injectable } from '@nestjs/common';
import { Conversation, Message } from '@prisma/client';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async getConversation(conversationId: string) {
    const data = await this.redis.get(`conversation:${conversationId}`);
    return data ? JSON.parse(data) : { id: conversationId, messages: [] };
  }

  async saveConversation(conversationId: string, conversation: Conversation) {
    await this.redis.set(
      `conversation:${conversationId}`,
      JSON.stringify(conversation),
    );
  }

  async saveNewMessage(conversationId: string, message: Message) {
    await this.redis.rpush(
      `conversation:${conversationId}:messages`,
      JSON.stringify(message),
    );
  }

  async appendToMessage(
    conversationId: string,
    messageId: string,
    chunk: string,
  ) {
    const conversation = await this.getConversation(conversationId);

    const message = conversation.messages.find(
      (message) => message.id === messageId,
    );
    if (message) {
      message.content += chunk;
      await this.saveConversation(conversationId, conversation);
    }
  }
  async getMessages(conversationId: string): Promise<Message[]> {
    const messages = await this.redis.lrange(
      `conversation:${conversationId}:messages`,
      0,
      -1,
    );
    return messages.map((m) => JSON.parse(m) as Message);
  }
}
