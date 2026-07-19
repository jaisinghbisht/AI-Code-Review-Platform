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
@Table(name = "file_analysis")
public class FileAnalysis {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id")
    private ProjectAnalysis analysis;

    private String filePath;
    private String packageName;
    private int lineCount;

    @OneToMany(mappedBy = "fileAnalysis", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<TypeDefinition> typeDefinitions = new HashSet<>();

    @OneToMany(mappedBy = "fileAnalysis", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<CheckstyleViolation> checkstyleViolations = new HashSet<>();

    public void addTypeDefinition(TypeDefinition typeDefinition) {
        typeDefinitions.add(typeDefinition);
        typeDefinition.setFileAnalysis(this);
    }

    public void addCheckstyleViolation(CheckstyleViolation violation) {
        checkstyleViolations.add(violation);
        violation.setFileAnalysis(this);
    }
}
