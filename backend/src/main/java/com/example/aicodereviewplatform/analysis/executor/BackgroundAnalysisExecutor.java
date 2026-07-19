package com.example.aicodereviewplatform.analysis.executor;

import com.example.aicodereviewplatform.analysis.model.AnalysisJobStatus;
import com.example.aicodereviewplatform.analysis.service.AnalysisProgressService;
import com.example.aicodereviewplatform.analysis.service.AnalysisService;
import com.example.aicodereviewplatform.analysis.ai.AiReviewService;
import com.example.aicodereviewplatform.project.model.Project;
import com.example.aicodereviewplatform.project.model.ProjectStatus;
import com.example.aicodereviewplatform.project.repository.ProjectRepository;
import com.example.aicodereviewplatform.project.scanner.ProjectScanner;
import com.example.aicodereviewplatform.project.storage.StorageService;
import com.example.aicodereviewplatform.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackgroundAnalysisExecutor {

    private final ProjectRepository projectRepository;
    private final StorageService storageService;
    private final ProjectScanner projectScanner;
    private final AnalysisService analysisService;
    private final AiReviewService aiReviewService;
    private final AnalysisProgressService progressService;

    // Use a fixed pool to prevent overloading local hardware resources (e.g. running multiple LLMs simultaneously)
    private final ExecutorService executor = Executors.newFixedThreadPool(2);

    public void executeAnalysisAsync(UUID jobId, UUID projectId, Path archivePath) {
        executor.submit(() -> {
            log.info("Starting background analysis for job {}, project {}", jobId, projectId);
            try {
                // 1. EXTRACTING
                progressService.updateProgress(jobId, AnalysisJobStatus.EXTRACTING, 10, "Extracting project archive ZIP file...", 25000L);
                
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

                Path extractPath = storageService.extract(archivePath, projectId);

                // 2. SCANNING
                progressService.updateProgress(jobId, AnalysisJobStatus.SCANNING, 25, "Scanning project folders and files...", 20000L);
                Path actualRoot = determineActualRoot(extractPath);
                
                project.setRootDirectory(actualRoot.toString());
                List<Path> javaFiles = projectScanner.findJavaFiles(actualRoot);
                if (javaFiles.isEmpty()) {
                    throw new RuntimeException("No Java files found in the project.");
                }

                project.setJavaFiles(javaFiles.size());
                project.setTotalFiles(countTotalFiles(actualRoot));
                project.setSpringBootProject(projectScanner.isSpringBootProject(actualRoot));
                project.setMavenProject(projectScanner.isMavenProject(actualRoot));
                project.setGradleProject(projectScanner.isGradleProject(actualRoot));
                project.setEstimatedLinesOfCode(javaFiles.size() * 100L);
                project.setStatus(ProjectStatus.READY);
                projectRepository.save(project);

                // 3. ANALYZING
                progressService.updateProgress(jobId, AnalysisJobStatus.ANALYZING, 40, "Running JavaParser code analysis...", 15000L);
                UUID analysisId = analysisService.runAnalysis(projectId);

                // 4. GENERATING_REVIEW
                progressService.updateProgress(jobId, AnalysisJobStatus.GENERATING_REVIEW, 65, "Sending review prompt to local LLM...", 10000L);
                aiReviewService.generateReview(analysisId);

                // 5. SAVING
                progressService.updateProgress(jobId, AnalysisJobStatus.SAVING, 95, "Saving analysis reports and reviews...", 2000L);

                // 6. COMPLETED
                progressService.completeJob(jobId);

            } catch (Exception e) {
                log.error("Error executing background analysis for job {}", jobId, e);
                progressService.failJob(jobId, e.getMessage());
                
                // Set project status to FAILED in case of issues
                try {
                    projectRepository.findById(projectId).ifPresent(project -> {
                        project.setStatus(ProjectStatus.FAILED);
                        projectRepository.save(project);
                    });
                } catch (Exception ex) {
                    log.error("Failed to mark project as failed", ex);
                }
            }
        });
    }

    private Path determineActualRoot(Path extractPath) throws IOException {
        try (var stream = Files.list(extractPath)) {
            List<Path> contents = stream.toList();
            if (contents.size() == 1 && Files.isDirectory(contents.get(0))) {
                return contents.get(0);
            }
        }
        return extractPath;
    }

    private int countTotalFiles(Path dir) {
        try (var stream = Files.walk(dir)) {
            return (int) stream
                    .filter(Files::isRegularFile)
                    .count();
        } catch (IOException e) {
            return 0;
        }
    }
}
