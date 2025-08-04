import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createIssueDto } from './dto/create-issue.dto';

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

  async createIssue(createIssueDto: createIssueDto) {
    try {
      const newIssue = await this.prisma.issue.create({
        data: {
          ...createIssueDto,
        },
      });

      return newIssue;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch issues by property ' + error,
      );
    }
  }
}
