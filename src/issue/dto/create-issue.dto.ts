import { IssuePriority, IssueStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class createIssueDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(IssueStatus)
  status: IssueStatus;

  @IsUUID()
  propertyId: string;

  @IsEnum(IssuePriority)
  priority: IssuePriority;
}
