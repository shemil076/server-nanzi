import { Module } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.AI_SERVICE_BASE_URL,
      timeout: 10000,
    }),
  ],
  providers: [AiServiceService],
  exports: [AiServiceService],
})
export class AiServiceModule {}
