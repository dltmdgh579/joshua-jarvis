import { APIResponse } from "./api";

export interface AIRecommendation {
  title: string;
  isAIRecommended: boolean;
}

export type AIRecommendationResponse = APIResponse<AIRecommendation[]>;

export interface OpenAIError {
  message: string;
  type?: string;
  code?: string;
  param?: string;
}
