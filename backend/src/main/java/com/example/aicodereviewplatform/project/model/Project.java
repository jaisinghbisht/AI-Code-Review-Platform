package com.example.aicodereviewplatform.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "project")
public class Project {

    @Id
    private UUID id;

    private String projectName;

    private String archiveName;

    private String rootDirectory;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    private int totalFiles;

    private int javaFiles;

    private int packageCount;

    private long estimatedLinesOfCode;

    private String mainClass;

    private boolean isSpringBootProject;

    private boolean isMavenProject;

    private boolean isGradleProject;

    private LocalDateTime uploadTimestamp;
}
