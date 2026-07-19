package com.example.aicodereviewplatform.analysis.dto;

import com.example.aicodereviewplatform.analysis.model.AnalysisStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AnalysisDTO {
    private UUID id;
    private UUID projectId;
    private AnalysisStatus status;
    private int totalClasses;
    private int totalInterfaces;
    private int totalEnums;
    private int totalRecords;
    private int totalMethods;
    private int totalFields;
    private int totalConstructors;
    private LocalDateTime analysisTimestamp;
    private List<FileAnalysisDTO> fileAnalyses;
}
