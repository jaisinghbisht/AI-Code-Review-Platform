package com.example.aicodereviewplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeReviewResult {
    private String bugs;
    private String securityIssues;
    private String performanceIssues;
    private String maintainabilityIssues;
    private String refactoringSuggestions;
    private String overallSummary;
}