import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-status.dto';
import { AiServiceService } from '../ai-service/ai-service.service';

@Injectable()
export class IssueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiServiceService,
  ) {}

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

  async createIssue(createIssueDto: CreateIssueDto) {
    try {
      const newIssue = await this.prisma.issue.create({
        data: {
          ...createIssueDto,
        },
      });

      await this.aiService.classifyMaintenanceTicket(newIssue.description);

      return newIssue;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch issues by property ' + error,
      );
    }
  }

  async updateStatus(dto: UpdateIssueStatusDto) {
    try {
      const updatedIssue = await this.prisma.issue.update({
        where: {
          id: dto.id,
        },
        data: {
          status: dto.status,
        },
      });

      return updatedIssue;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update issue status ' + error,
      );
    }
  }
}
