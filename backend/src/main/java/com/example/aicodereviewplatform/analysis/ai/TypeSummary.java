package com.example.aicodereviewplatform.analysis.ai;

public record TypeSummary(
    String typeName,
    String type, // e.g. CLASS, INTERFACE
    String filePath,
    int lineCount,
    int methodCount,
    int fieldCount
) {}
