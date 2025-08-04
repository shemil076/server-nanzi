import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IssueService } from './issue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';
import { createIssueDto } from './dto/create-issue.dto';

@Controller('issue')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post('create')
  @Roles(Role.TENANT)
  async create(@Body() dto: createIssueDto) {
    return this.issueService.createIssue(dto);
  }

  @Get(':id')
  async getIssuesByProperty(@Param('id') id: string) {
    return this.issueService.getIssuesByProperty(id);
  }
}
