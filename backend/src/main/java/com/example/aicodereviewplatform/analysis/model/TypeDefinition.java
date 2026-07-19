package com.example.aicodereviewplatform.analysis.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
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
    private Set<MethodDefinition> methodDefinitions = new HashSet<>();

    public void addMethodDefinition(MethodDefinition methodDefinition) {
        methodDefinitions.add(methodDefinition);
        methodDefinition.setTypeDefinition(this);
    }
}
