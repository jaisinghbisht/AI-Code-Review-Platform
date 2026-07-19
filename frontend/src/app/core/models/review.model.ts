export interface ReviewResult {
  bugs: string;
  securityIssues: string;
  performanceIssues: string;
  maintainabilityIssues: string;
  refactoringSuggestions: string;
  overallSummary: string;
}

export interface ReviewResponse {
  id: number;
  submissionId: number;
  bugs: string;
  securityIssues: string;
  performanceIssues: string;
  maintainabilityIssues: string;
  refactoringSuggestions: string;
  overallSummary: string;
  createdAt: string;
}
