import { IsEmail } from 'class-validator';
import { CreateBookingDto } from 'src/booking/dto/create-booking.dto';

export class CreateTenantInvitation extends CreateBookingDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
