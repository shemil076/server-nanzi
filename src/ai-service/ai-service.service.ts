import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AiClassificationResponse } from './ai-response.interface';

@Injectable()
export class AiServiceService {
  constructor(private readonly httpService: HttpService) {}

  async classifyMaintenanceTicket(
    description: string,
  ): Promise<AiClassificationResponse> {
    try {
      const res =
        await this.httpService.axiosRef.post<AiClassificationResponse>(
          '/ai/classify',
          {
            ticket_description: description,
          },
        );
      return res.data;
    } catch (err) {
      console.error('Error calling AI API', err);
      throw err;
    }
  }
}
