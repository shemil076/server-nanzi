import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        },
      });

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch user details' + error,
      );
    }
  }
}
