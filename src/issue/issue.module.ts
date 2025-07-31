import { Module } from '@nestjs/common';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { JwtUtils } from '../utils/auth.utils';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IssueService, JwtUtils],
  controllers: [IssueController],
})
export class IssueModule {}
