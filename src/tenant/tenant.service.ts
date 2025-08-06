import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchTenantByEmail(query: string) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return [];
    }
    try {
      const trimmed = query.trim();

      if (trimmed.length < 3) {
        return [];
      }

      const tenantsStartWith = await this.prisma.user.findMany({
        where: {
          email: {
            contains: trimmed.toLowerCase(),
          },
          role: 'TENANT',
        },
        take: 10,
      });

      return tenantsStartWith;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch tenants' + error);
    }
  }
}
