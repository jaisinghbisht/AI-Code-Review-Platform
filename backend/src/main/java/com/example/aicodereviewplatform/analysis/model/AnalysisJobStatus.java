package com.example.aicodereviewplatform.analysis.model;

public enum AnalysisJobStatus {
    QUEUED,
    EXTRACTING,
    SCANNING,
    ANALYZING,
    GENERATING_REVIEW,
    SAVING,
    COMPLETED,
    FAILED
}
