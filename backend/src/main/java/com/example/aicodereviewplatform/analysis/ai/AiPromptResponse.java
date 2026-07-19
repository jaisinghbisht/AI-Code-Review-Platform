package com.example.aicodereviewplatform.analysis.ai;

import java.util.UUID;

public record AiPromptResponse(
    UUID analysisId,
    String prompt,
    int estimatedTokens
) {}
