import { CreateBookingDto } from '../../booking/dto/create-booking.dto';
import { IsEmail } from 'class-validator';

export class CreateTenantInvitationDto extends CreateBookingDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
