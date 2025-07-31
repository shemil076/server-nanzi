import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaidPayments(propertyId: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          status: 'APPROVED',
          booking: {
            propertyId: propertyId,
          },
        },
        orderBy: {
          paidAt: 'desc',
        },
      });

      return payments;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch paid payments' + error,
      );
    }
  }
}
