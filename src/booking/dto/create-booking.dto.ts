import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  invitationId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}
