import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewInstallmentDto } from './dto/new-installment.dto';

@Injectable()
export class InstallmentService {
  constructor(private readonly prisma: PrismaService) {}

  async createInstallment(installmentDto: NewInstallmentDto) {
    try {
      const installment = await this.prisma.installment.create({
        data: {
          paymentId: installmentDto.paymentId,
          amount: installmentDto.amount,
          paidAt: new Date(),
        },
      });

      return installment;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to pay the installment : ${message}`,
      );
    }
  }
}
