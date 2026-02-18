export interface AiClassificationResponse {
  category: string;
  urgency: string;
  description: string;
  suggestions: string;
  confidence: number;
}
