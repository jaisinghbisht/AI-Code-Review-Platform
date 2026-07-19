export interface SubmissionRequest {
  filename: string;
  language: string;
  sourceCode: string;
}

export interface SubmissionResponse {
  submissionId: number;
}
