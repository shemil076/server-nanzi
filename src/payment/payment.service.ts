import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addMonths } from 'date-fns';
import { PaymentStatus, Prisma } from '@prisma/client';
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

  async getThisMonthRentPayment(tenantId: string, propertyId: string) {
    try {
      let payment = await this.prisma.payment.findFirst({
        where: {
          status: 'PENDING',
          lease: {
            propertyId: propertyId,
            tenantId: tenantId,
          },
        },
      });
      if (payment) return payment;
      payment = await this.prisma.payment.findFirst({
        where: {
          lease: {
            propertyId: propertyId,
            tenantId: tenantId,
          },
          dueDate: {
            gte: new Date(),
          },
        },
      });
      console.log('payment =>> ', payment);
      return payment;
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

  async payInstallment(newInstallmentDto: NewInstallmentDto) {
    try {
      const currentPayment = await this.prisma.payment.findUnique({
        where: {
          id: newInstallmentDto.paymentId,
        },
        include: {
          installment: true,
        },
      });

      const installments = currentPayment?.installment;

      const totalPaidAmount =
        installments?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

      if (
        currentPayment != null &&
        currentPayment.amount >= totalPaidAmount + newInstallmentDto.amount
      ) {
        const newInstallment =
          await this.installmentService.createInstallment(newInstallmentDto);

        const paymentStatus =
          currentPayment.amount == totalPaidAmount + newInstallmentDto.amount
            ? PaymentStatus.PAID
            : PaymentStatus.PARTIAL;

        const paidAt = paymentStatus == PaymentStatus.PAID ? new Date() : null;

        if (newInstallment != null) {
          const paidPayment = await this.prisma.payment.update({
            where: {
              id: newInstallmentDto.paymentId,
            },
            data: {
              status: paymentStatus,
              paidAt,
            },
          });

          return paidPayment;
        }
      } else {
        if (!currentPayment) {
          throw new NotFoundException(
            `Payment with ID ${newInstallmentDto.paymentId} not found`,
          );
        } else {
          throw new BadRequestException(
            `Installment amount exceeds remaining payment. Payment amount: ${currentPayment.amount}, Already paid: ${totalPaidAmount}, Attempted new installment: ${newInstallmentDto.amount}`,
          );
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to pay the installment' + error,
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
    // console.log('Running cron job to create a payment');
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

      // console.log(`Lease count ${leases.length}`);

      for (const leaseData of leases) {
        const { payments, ...lease } = leaseData;

        console.log(`Current lease => ${lease.id}`);

        const lastPaymentDate = payments[0]
          ? new Date(payments[0].dueDate)
          : new Date(lease.startDate);

        const nextDueDate = addMonths(lastPaymentDate, 1);

        // console.log(
        //   `nextDueDate before condition => ${nextDueDate.toDateString()}`,
        // );

        if (nextDueDate <= lease.endDate && new Date() >= nextDueDate) {
          console.log(`nextDueDate => ${nextDueDate.toDateString()}`);

          await this.prisma.payment.create({
            data: {
              leaseId: lease.id,
              amount: lease.rentAmount,
              dueDate: nextDueDate,
            },
          });

          // console.log(
          //   `Payment generated for lease ${lease.id} on ${nextDueDate.toLocaleDateString()}`,
          // );
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
