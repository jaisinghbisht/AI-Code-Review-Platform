package com.example.aicodereviewplatform.analysis.mapper;

import com.example.aicodereviewplatform.analysis.dto.AnalysisDTO;
import com.example.aicodereviewplatform.analysis.dto.FileAnalysisDTO;
import com.example.aicodereviewplatform.analysis.dto.MethodDefinitionDTO;
import com.example.aicodereviewplatform.analysis.dto.TypeDefinitionDTO;
import com.example.aicodereviewplatform.analysis.model.FileAnalysis;
import com.example.aicodereviewplatform.analysis.model.MethodDefinition;
import com.example.aicodereviewplatform.analysis.model.ProjectAnalysis;
import com.example.aicodereviewplatform.analysis.model.TypeDefinition;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class AnalysisMapper {

    public AnalysisDTO toDto(ProjectAnalysis entity) {
        return AnalysisDTO.builder()
                .id(entity.getId())
                .projectId(entity.getProject().getId())
                .status(entity.getStatus())
                .totalClasses(entity.getTotalClasses())
                .totalInterfaces(entity.getTotalInterfaces())
                .totalEnums(entity.getTotalEnums())
                .totalRecords(entity.getTotalRecords())
                .totalMethods(entity.getTotalMethods())
                .totalFields(entity.getTotalFields())
                .totalConstructors(entity.getTotalConstructors())
                .analysisTimestamp(entity.getAnalysisTimestamp())
                .fileAnalyses(entity.getFileAnalyses().stream()
                        .map(this::toDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private FileAnalysisDTO toDto(FileAnalysis entity) {
        return FileAnalysisDTO.builder()
                .filePath(entity.getFilePath())
                .packageName(entity.getPackageName())
                .lineCount(entity.getLineCount())
                .typeDefinitions(entity.getTypeDefinitions().stream()
                        .map(this::toDto)
                        .collect(Collectors.toList()))
                .checkstyleViolations(entity.getCheckstyleViolations())
                .build();
    }

    private TypeDefinitionDTO toDto(TypeDefinition entity) {
        return TypeDefinitionDTO.builder()
                .typeName(entity.getTypeName())
                .type(entity.getType())
                .visibility(entity.getVisibility())
                .isAbstract(entity.isAbstract())
                .isFinal(entity.isFinal())
                .superclassName(entity.getSuperclassName())
                .fieldCount(entity.getFieldCount())
                .methodCount(entity.getMethodCount())
                .constructorCount(entity.getConstructorCount())
                .lineCount(entity.getLineCount())
                .methodDefinitions(entity.getMethodDefinitions().stream()
                        .map(this::toDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private MethodDefinitionDTO toDto(MethodDefinition entity) {
        return MethodDefinitionDTO.builder()
                .methodName(entity.getMethodName())
                .returnType(entity.getReturnType())
                .visibility(entity.getVisibility())
                .isStatic(entity.isStatic())
                .isFinal(entity.isFinal())
                .isAbstract(entity.isAbstract())
                .lineCount(entity.getLineCount())
                .parameters(entity.getParameters())
                .annotations(entity.getAnnotations())
                .exceptions(entity.getExceptions())
                .build();
    }
}
