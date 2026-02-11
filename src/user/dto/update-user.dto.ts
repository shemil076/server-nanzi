import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdataUserDetailDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'First name must be at least 3 characters long' })
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Last name must be at least 3 characters long' })
  lastName: string;
}
