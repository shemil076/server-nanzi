import { IsDate, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  propertyId: string;

  @IsUUID()
  userId: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
