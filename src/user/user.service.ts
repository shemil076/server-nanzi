import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserDetails(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      });

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch user details' + error,
      );
    }
  }

  async createTenantViaInvitation(dto: RegisterUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create the user' + error,
      );
    }
  }
}
