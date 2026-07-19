package com.example.aicodereviewplatform.analysis.ai;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ReviewDTO(
    UUID id,
    UUID analysisId,
    String model,
    LocalDateTime createdAt,
    String status,
    Integer promptTokens,
    Integer completionTokens,
    Integer totalTokens,
    Long executionTimeMs,
    List<ReviewSectionDTO> sections
) {}
