import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IssueService {
  constructor(private readonly prisma: PrismaService) {}

  async getIssuesByProperty(propertyId: string) {
    try {
      const issues = await this.prisma.issue.findMany({
        where: {
          propertyId,
        },
        orderBy: {
          reportedAt: 'desc',
        },
      });

      return issues;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch issues by property ' + error,
      );
    }
  }
}
