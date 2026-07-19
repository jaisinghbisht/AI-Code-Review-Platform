package com.example.aicodereviewplatform.analysis.ai;

public record FileSummary(
    String filePath,
    int lineCount,
    int checkstyleViolationsCount
) {}
