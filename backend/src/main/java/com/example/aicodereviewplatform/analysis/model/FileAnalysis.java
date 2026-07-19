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
    private List<TypeDefinition> typeDefinitions = new ArrayList<>();

    public void addTypeDefinition(TypeDefinition typeDefinition) {
        typeDefinitions.add(typeDefinition);
        typeDefinition.setFileAnalysis(this);
    }
}
