package com.example.aicodereviewplatform.analysis.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "type_definition")
public class TypeDefinition {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_analysis_id")
    private FileAnalysis fileAnalysis;

    private String typeName;
    private String type; // e.g., CLASS, INTERFACE
    private String visibility;
    private boolean isAbstract;
    private boolean isFinal;
    private String superclassName;
    private int fieldCount;
    private int methodCount;
    private int constructorCount;
    private int lineCount;

    @OneToMany(mappedBy = "typeDefinition", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MethodDefinition> methodDefinitions = new ArrayList<>();

    public void addMethodDefinition(MethodDefinition methodDefinition) {
        methodDefinitions.add(methodDefinition);
        methodDefinition.setTypeDefinition(this);
    }
}
