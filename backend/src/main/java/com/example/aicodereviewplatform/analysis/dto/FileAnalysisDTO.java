package com.example.aicodereviewplatform.analysis.dto;

import com.example.aicodereviewplatform.analysis.model.CheckstyleViolation;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@Builder
public class FileAnalysisDTO {
    private String filePath;
    private String packageName;
    private int lineCount;
    private List<TypeDefinitionDTO> typeDefinitions;
    private Set<CheckstyleViolation> checkstyleViolations;
}
