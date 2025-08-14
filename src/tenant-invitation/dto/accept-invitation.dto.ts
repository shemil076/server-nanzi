import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'First name must be at least 3 characters long' })
  firstName: string;

  @IsString()
  @MinLength(3, { message: 'Last name must be at least 3 characters long' })
  lastName: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsUUID()
  invitationId: string;
}
