import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths } from 'date-fns';

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

  private isRunningCroneJob = false;
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'generate-monthly-payment',
    timeZone: 'Asia/Colombo',
  })
  async generateMonthlyPayment() {
    if (this.isRunningCroneJob) return;

    this.isRunningCroneJob = true;

    try {
      const leases = await this.prisma.lease.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      for (const lease of leases) {
        const lastPayment = await this.prisma.payment.findFirst({
          where: {
            leaseId: lease.id,
          },
          orderBy: {
            dueDate: 'desc',
          },
        });

        const nextDueDate = lastPayment
          ? addMonths(lastPayment.dueDate, 1)
          : lease.startDate;

        if (nextDueDate < lease.endDate) {
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
    } catch (error) {
      console.error('Error generating payments:', error);
    } finally {
      this.isRunningCroneJob = false;
    }
  }
}
