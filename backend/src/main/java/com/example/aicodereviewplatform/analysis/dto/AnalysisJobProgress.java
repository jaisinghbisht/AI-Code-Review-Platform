package com.example.aicodereviewplatform.analysis.dto;

import com.example.aicodereviewplatform.analysis.model.AnalysisJobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisJobProgress {
    private UUID jobId;
    private UUID projectId;
    private AnalysisJobStatus status;
    private int percentage;
    private String currentStep;
    private LocalDateTime startedAt;
    private LocalDateTime updatedAt;
    private Long estimatedRemainingMs;
    private String errorMessage;
}
