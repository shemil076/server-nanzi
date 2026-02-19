import {
  Ai_MaintenanceCategory,
  Ai_MaintenanceUrgencyLevel,
} from '@prisma/client';

export interface AiClassificationResponse {
  category: Ai_MaintenanceCategory;
  urgency: Ai_MaintenanceUrgencyLevel;
  description: string;
  suggestions: string;
  confidence: number;
}
