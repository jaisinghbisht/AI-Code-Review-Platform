package com.example.aicodereviewplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeReviewResponse {
    private Long id;
    private Long submissionId;
    private String bugs;
    private String securityIssues;
    private String performanceIssues;
    private String maintainabilityIssues;
    private String refactoringSuggestions;
    private String overallSummary;
    private LocalDateTime createdAt;
}
