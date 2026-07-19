package com.example.aicodereviewplatform.analysis.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MethodDefinitionDTO {
    private String methodName;
    private String returnType;
    private String visibility;
    private boolean isStatic;
    private boolean isFinal;
    private boolean isAbstract;
    private int lineCount;
    private List<String> parameters;
    private List<String> annotations;
    private List<String> exceptions;
}
