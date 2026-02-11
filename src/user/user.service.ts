import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
import { UpdataUserDetailDto } from './dto/update-user.dto';

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

  updateUserInfo = async (
    where: Prisma.UserWhereUniqueInput,
    data: UpdataUserDetailDto,
  ): Promise<User> => {
    try {
      const updatedUser = await this.prisma.user.update({
        where,
        data,
      });

      return updatedUser;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.code === 'P2001'
      ) {
        throw new NotFoundException('User not found');
      }

      throw new InternalServerErrorException('Failed to update user');
    }
  };
}
