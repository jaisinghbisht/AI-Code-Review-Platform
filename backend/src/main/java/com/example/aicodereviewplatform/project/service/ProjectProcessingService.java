package com.example.aicodereviewplatform.project.service;

import com.example.aicodereviewplatform.exception.ResourceNotFoundException;
import com.example.aicodereviewplatform.project.dto.ProjectInfoDTO;
import com.example.aicodereviewplatform.project.exception.ProjectProcessingException;
import com.example.aicodereviewplatform.project.mapper.ProjectMapper;
import com.example.aicodereviewplatform.project.model.Project;
import com.example.aicodereviewplatform.project.model.ProjectStatus;
import com.example.aicodereviewplatform.project.repository.ProjectRepository;
import com.example.aicodereviewplatform.project.scanner.ProjectScanner;
import com.example.aicodereviewplatform.project.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectProcessingService {

    private final StorageService storageService;
    private final ProjectScanner projectScanner;
    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final com.example.aicodereviewplatform.analysis.executor.BackgroundAnalysisExecutor backgroundAnalysisExecutor;
    private final com.example.aicodereviewplatform.analysis.service.AnalysisProgressService progressService;

    @Transactional
    public com.example.aicodereviewplatform.project.dto.UploadResponse initiateUpload(MultipartFile file, UUID jobId) {
        if (file.isEmpty()) {
            throw new ProjectProcessingException("Cannot upload empty file.");
        }

        UUID projectId = UUID.randomUUID();

        Project project = Project.builder()
                .id(projectId)
                .projectName(file.getOriginalFilename())
                .archiveName(file.getOriginalFilename())
                .status(ProjectStatus.PROCESSING)
                .uploadTimestamp(LocalDateTime.now())
                .rootDirectory("")
                .mainClass(null)
                .totalFiles(0)
                .javaFiles(0)
                .packageCount(0)
                .estimatedLinesOfCode(0)
                .build();

        project = projectRepository.save(project);

        try {
            Path archivePath = storageService.store(file, projectId);
            
            // Create job status tracker
            progressService.createJob(jobId, projectId);

            // Trigger background execution after the transaction commits to avoid race conditions
            if (TransactionSynchronizationManager.isActualTransactionActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        backgroundAnalysisExecutor.executeAnalysisAsync(jobId, projectId, archivePath);
                    }
                });
            } else {
                backgroundAnalysisExecutor.executeAnalysisAsync(jobId, projectId, archivePath);
            }

            return new com.example.aicodereviewplatform.project.dto.UploadResponse(projectId, jobId);

        } catch (Exception e) {
            log.error("Failed to initiate upload for project {}", projectId, e);
            project.setStatus(ProjectStatus.FAILED);
            projectRepository.save(project);
            throw new ProjectProcessingException("Failed to initiate project upload: " + e.getMessage(), e);
        }
    }

    @Transactional
    public ProjectInfoDTO processUpload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ProjectProcessingException("Cannot upload empty file.");
        }

        UUID projectId = UUID.randomUUID();
        
        Project project = Project.builder()
                .id(projectId)
                .projectName(file.getOriginalFilename())
                .archiveName(file.getOriginalFilename())
                .status(ProjectStatus.UPLOADED)
                .uploadTimestamp(LocalDateTime.now())
                .rootDirectory("") // Set later
                .mainClass(null) // To be implemented later
                .totalFiles(0)
                .javaFiles(0)
                .packageCount(0)
                .estimatedLinesOfCode(0)
                .build();
                
        project = projectRepository.save(project);

        try {
            project.setStatus(ProjectStatus.PROCESSING);
            projectRepository.save(project);

            Path archivePath = storageService.store(file, projectId);
            Path extractPath = storageService.extract(archivePath, projectId);

            // Determine root directory (sometimes zips have a single top-level folder)
            Path actualRoot = determineActualRoot(extractPath);
            project.setRootDirectory(actualRoot.toString());

            List<Path> javaFiles = projectScanner.findJavaFiles(actualRoot);
            if (javaFiles.isEmpty()) {
                throw new ProjectProcessingException("No Java files found in the project.");
            }

            project.setJavaFiles(javaFiles.size());
            project.setTotalFiles(countTotalFiles(actualRoot));
            project.setSpringBootProject(projectScanner.isSpringBootProject(actualRoot));
            project.setMavenProject(projectScanner.isMavenProject(actualRoot));
            project.setGradleProject(projectScanner.isGradleProject(actualRoot));
            
            // Rough estimation, actual LOC would require reading files
            project.setEstimatedLinesOfCode(javaFiles.size() * 100L); 
            
            Set<String> packages = javaFiles.stream()
                .map(p -> p.getParent().toString())
                .collect(Collectors.toSet());
            project.setPackageCount(packages.size());

            project.setStatus(ProjectStatus.READY);
            project = projectRepository.save(project);
            
            ProjectInfoDTO dto = projectMapper.toDto(project);
            dto.setJavaFilePaths(javaFiles.stream().map(Path::toString).collect(Collectors.toSet()));
            dto.setPackages(packages);
            return dto;

        } catch (Exception e) {
            log.error("Failed to process project {}: {}", projectId, e.getMessage());
            project.setStatus(ProjectStatus.FAILED);
            projectRepository.save(project);
            throw new ProjectProcessingException("Project processing failed: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ProjectInfoDTO getProjectInfo(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        
        ProjectInfoDTO dto = projectMapper.toDto(project);
        
        if (project.getStatus() == ProjectStatus.READY) {
            Path rootDir = Path.of(project.getRootDirectory());
            List<Path> javaFiles = projectScanner.findJavaFiles(rootDir);
            dto.setJavaFilePaths(javaFiles.stream().map(Path::toString).collect(Collectors.toSet()));
            dto.setPackages(javaFiles.stream().map(p -> p.getParent().toString()).collect(Collectors.toSet()));
        }
        
        return dto;
    }

    @Transactional(readOnly = true)
    public List<ProjectInfoDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }
    
    private Path determineActualRoot(Path extractPath) throws IOException {
        List<Path> contents = Files.list(extractPath).toList();
        if (contents.size() == 1 && Files.isDirectory(contents.get(0))) {
            return contents.get(0);
        }
        return extractPath;
    }
    
    private int countTotalFiles(Path dir) {
        try {
            return (int) Files.walk(dir)
                    .filter(Files::isRegularFile)
                    .count();
        } catch (IOException e) {
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public String getFileContent(UUID projectId, String filePath) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        Path projectRoot = Path.of(project.getRootDirectory()).toAbsolutePath().normalize();
        Path file = Path.of(filePath).toAbsolutePath().normalize();
        
        // Security check: ensure path is within the project root directory
        if (!file.startsWith(projectRoot)) {
            throw new IllegalArgumentException("Path is outside project root");
        }
        
        try {
            return Files.readString(file);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file content", e);
        }
    }
}
