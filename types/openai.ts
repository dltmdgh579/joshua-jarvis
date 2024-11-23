export interface AIRecommendation {
  title: string;
  isAIRecommended: boolean;
}

export interface AIResponse {
  success: boolean;
  data?: AIRecommendation[];
  error?: any;
}
