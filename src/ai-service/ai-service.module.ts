import { Module } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AiServiceService],
  exports: [AiServiceService],
})
export class AiServiceModule {}
