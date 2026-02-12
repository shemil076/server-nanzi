import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths } from 'date-fns';
import { Prisma } from '@prisma/client';
import { InstallmentService } from '../installment/installment.service';
import { NewInstallmentDto } from '../installment/dto/new-installment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly installmentService: InstallmentService,
  ) {}

  async getPaidPayments(propertyId: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          lease: {
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

  async getCurrentPendingPayment(tenantId: string, propertyId: string) {
    try {
      const currentPendingPayment = await this.prisma.payment.findFirst({
        where: {
          status: 'PENDING',
          lease: {
            propertyId: propertyId,
            tenantId: tenantId,
          },
        },
      });
      return currentPendingPayment;
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to fetch the tenant's current payments" + error,
      );
    }
  }

  async getCurrentTenantsPayments(tenantId: string, propertyId: string) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          lease: {
            tenantId,
            propertyId: propertyId,
          },
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

  async payFullPayment(newInstallmentDto: NewInstallmentDto) {
    try {
      const fullyPaidInstallment =
        await this.installmentService.createInstallment(newInstallmentDto);

      if (fullyPaidInstallment != null) {
        const paidPayment = await this.prisma.payment.update({
          where: {
            id: newInstallmentDto.paymentId,
          },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        return paidPayment;
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to pay the full payment' + error,
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
