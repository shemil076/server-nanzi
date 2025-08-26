import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaidPayments(propertyId: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          // booking: {
          //   propertyId: propertyId,
          // },
          // OR: [{ status: 'APPROVED' }, { status: 'REJECTED' }],
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

  async getCurrentTenantsPayments(tenantId: string, propertyId: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          // booking: {
          //   tenantId,
          //   propertyId: propertyId,
          // },
          // OR: [{ status: 'APPROVED' }, { status: 'REJECTED' }],/
        },
        orderBy: {
          paidAt: 'desc',
        },
      });
      return payments;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch the current tenants paid payments' + error,
      );
    }
  }
}
