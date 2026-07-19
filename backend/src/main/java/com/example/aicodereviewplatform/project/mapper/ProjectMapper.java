package com.example.aicodereviewplatform.project.mapper;

import com.example.aicodereviewplatform.project.dto.ProjectInfoDTO;
import com.example.aicodereviewplatform.project.model.Project;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class ProjectMapper {

    public ProjectInfoDTO toDto(Project project) {
        return ProjectInfoDTO.builder()
                .id(project.getId())
                .projectName(project.getProjectName())
                .rootDirectory(project.getRootDirectory())
                .status(project.getStatus())
                .totalFiles(project.getTotalFiles())
                .javaFiles(project.getJavaFiles())
                .packageCount(project.getPackageCount())
                .estimatedLinesOfCode(project.getEstimatedLinesOfCode())
                .mainClass(project.getMainClass())
                .springBootProject(project.isSpringBootProject())
                .mavenProject(project.isMavenProject())
                .gradleProject(project.isGradleProject())
                .packages(Collections.emptySet()) // These are not stored in the entity
                .javaFilePaths(Collections.emptySet()) // These are not stored in the entity
                .uploadTimestamp(project.getUploadTimestamp())
                .build();
    }
}
