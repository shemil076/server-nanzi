import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '@prisma/client';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-status.dto';

@Controller('issue')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post('create')
  @Roles(Role.TENANT)
  async create(@Body() dto: CreateIssueDto) {
    return this.issueService.createIssue(dto);
  }

  @Get(':id')
  async getIssuesByProperty(@Param('id') id: string) {
    return this.issueService.getIssuesByProperty(id);
  }

  @Patch('status')
  @Roles(Role.LANDLORD)
  async updateStatus(@Body() dto: UpdateIssueStatusDto) {
    return this.issueService.updateStatus(dto);
  }
}
