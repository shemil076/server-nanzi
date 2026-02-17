import { IsUUID } from 'class-validator';

export class DeleteInstallmentDto {
  @IsUUID()
  paymentId!: string;

  @IsUUID()
  installmentId!: string;
}
