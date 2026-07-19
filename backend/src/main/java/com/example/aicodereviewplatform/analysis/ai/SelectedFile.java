package com.example.aicodereviewplatform.analysis.ai;

public record SelectedFile(
    String filePath,
    String className,
    String sourceCode
) {}
