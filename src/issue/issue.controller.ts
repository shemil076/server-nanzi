import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IssueService } from './issue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('issue')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Get(':id')
  async getIssuesByProperty(@Param('id') id: string) {
    return this.issueService.getIssuesByProperty(id);
  }
}
