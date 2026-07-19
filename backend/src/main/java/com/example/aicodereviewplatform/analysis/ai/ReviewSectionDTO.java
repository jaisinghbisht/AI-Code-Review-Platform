package com.example.aicodereviewplatform.analysis.ai;

import java.util.UUID;

public record ReviewSectionDTO(
    UUID id,
    String title,
    String content,
    int orderIndex
) {}
