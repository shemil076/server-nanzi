import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths } from 'date-fns';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaidPayments() {
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

  async getCurrentTenantsPayments() {
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

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_DAY_AT_MIDNIGHT
      : '*/30 * * * * *',
    { timeZone: 'Asia/Colombo' },
  )
  async generateMonthlyPayment() {
    console.log('Running cron job to create a payment');
    try {
      const leases = await this.prisma.lease.findMany({
        where: { status: 'ACTIVE' },
        include: {
          payments: {
            orderBy: { dueDate: 'desc' },
            take: 1,
          },
        },
      });

      console.log(`Lease count ${leases.length}`);

      for (const leaseData of leases) {
        const { payments, ...lease } = leaseData;

        console.log(`Current lease => ${lease.id}`);

        const lastPaymentDate = payments[0]
          ? new Date(payments[0].dueDate)
          : new Date(lease.startDate);

        const nextDueDate = addMonths(lastPaymentDate, 1);

        console.log(
          `nextDueDate before condition => ${nextDueDate.toDateString()}`,
        );

        if (nextDueDate <= lease.endDate && new Date() >= nextDueDate) {
          console.log(`nextDueDate => ${nextDueDate.toDateString()}`);

          await this.prisma.payment.create({
            data: {
              leaseId: lease.id,
              amount: lease.rentAmount,
              dueDate: nextDueDate,
            },
          });

          console.log(
            `Payment generated for lease ${lease.id} on ${nextDueDate.toLocaleDateString()}`,
          );
        }
      }
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.log('Payment already exists, skipping...');
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_DAY_AT_MIDNIGHT
      : '*/30 * * * * *',
    { timeZone: 'Asia/Colombo' },
  )
  async markOverDuePayment() {
    await this.prisma.payment.updateMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
      },
      data: { status: 'OVERDUE' },
    });
  }
}
