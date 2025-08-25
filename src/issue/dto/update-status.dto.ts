import { IssueStatus } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class UpdateIssueStatusDto {
  @IsUUID()
  id: string;

  @IsEnum(IssueStatus)
  status: IssueStatus;
}
