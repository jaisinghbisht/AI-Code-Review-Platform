package com.example.aicodereviewplatform.analysis.model;

import com.example.aicodereviewplatform.project.model.Project;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "project_analysis")
public class ProjectAnalysis {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Enumerated(EnumType.STRING)
    private AnalysisStatus status;

    private int totalClasses;
    private int totalInterfaces;
    private int totalEnums;
    private int totalRecords;
    private int totalMethods;
    private int totalFields;
    private int totalConstructors;

    private LocalDateTime analysisTimestamp;

    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FileAnalysis> fileAnalyses = new ArrayList<>();

    public void addFileAnalysis(FileAnalysis fileAnalysis) {
        fileAnalyses.add(fileAnalysis);
        fileAnalysis.setAnalysis(this);
    }
}
