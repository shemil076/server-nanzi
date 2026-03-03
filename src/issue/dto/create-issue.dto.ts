import { Ai_MaintenanceCategory, Ai_MaintenanceUrgencyLevel, IssuePriority } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  propertyId: string;

  @IsEnum(IssuePriority)
  priority: IssuePriority;

  @IsOptional()
  @IsEnum(Ai_MaintenanceCategory)
  ai_category: Ai_MaintenanceCategory

  @IsOptional()
  @IsEnum(Ai_MaintenanceUrgencyLevel)
  ai_urgency: Ai_MaintenanceUrgencyLevel

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ai_confidence: number

}