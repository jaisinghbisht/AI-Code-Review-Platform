package com.example.aicodereviewplatform.analysis.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TypeDefinitionDTO {
    private String typeName;
    private String type;
    private String visibility;
    private boolean isAbstract;
    private boolean isFinal;
    private String superclassName;
    private int fieldCount;
    private int methodCount;
    private int constructorCount;
    private int lineCount;
    private List<MethodDefinitionDTO> methodDefinitions;
}
