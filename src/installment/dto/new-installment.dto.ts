import { Type } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class NewInstallmentDto {
  @IsUUID()
  paymentId!: string;

  @IsNumber()
  @Type(() => Number)
  amount!: number;
}
