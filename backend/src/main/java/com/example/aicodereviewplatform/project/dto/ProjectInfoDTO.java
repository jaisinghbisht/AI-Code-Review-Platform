package com.example.aicodereviewplatform.project.dto;

import com.example.aicodereviewplatform.project.model.ProjectStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class ProjectInfoDTO {
    private UUID id;
    private String projectName;
    private String rootDirectory;
    private ProjectStatus status;
    private int totalFiles;
    private int javaFiles;
    private int packageCount;
    private long estimatedLinesOfCode;
    private String mainClass;
    private boolean springBootProject;
    private boolean mavenProject;
    private boolean gradleProject;
    private Set<String> packages;
    private Set<String> javaFilePaths;
    private LocalDateTime uploadTimestamp;
}
