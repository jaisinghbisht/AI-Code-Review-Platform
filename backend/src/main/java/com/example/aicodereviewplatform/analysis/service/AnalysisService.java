package com.example.aicodereviewplatform.analysis.service;

import com.example.aicodereviewplatform.analysis.model.AnalysisStatus;
import com.example.aicodereviewplatform.analysis.model.FileAnalysis;
import com.example.aicodereviewplatform.analysis.model.ProjectAnalysis;
import com.example.aicodereviewplatform.analysis.parser.FileParser;
import com.example.aicodereviewplatform.analysis.repository.ProjectAnalysisRepository;
import com.example.aicodereviewplatform.exception.ResourceNotFoundException;
import com.example.aicodereviewplatform.project.model.Project;
import com.example.aicodereviewplatform.project.repository.ProjectRepository;
import com.example.aicodereviewplatform.project.scanner.ProjectScanner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final ProjectRepository projectRepository;
    private final ProjectAnalysisRepository analysisRepository;
    private final ProjectScanner projectScanner;
    private final FileParser fileParser;

    @Transactional
    public UUID runAnalysis(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ProjectAnalysis analysis = ProjectAnalysis.builder()
                .id(UUID.randomUUID())
                .project(project)
                .status(AnalysisStatus.IN_PROGRESS)
                .analysisTimestamp(LocalDateTime.now())
                .build();
        analysis = analysisRepository.save(analysis);

        try {
            List<Path> javaFiles = projectScanner.findJavaFiles(Path.of(project.getRootDirectory()));

            List<FileAnalysis> fileAnalyses = javaFiles.parallelStream()
                    .map(fileParser::parse)
                    .filter(Objects::nonNull) // Filter out files that failed to parse
                    .toList();

            fileAnalyses.forEach(analysis::addFileAnalysis);

            // Aggregate metrics
            analysis.setTotalClasses((int) fileAnalyses.stream().flatMap(fa -> fa.getTypeDefinitions().stream()).filter(td -> "CLASS".equals(td.getType())).count());
            analysis.setTotalInterfaces((int) fileAnalyses.stream().flatMap(fa -> fa.getTypeDefinitions().stream()).filter(td -> "INTERFACE".equals(td.getType())).count());
            analysis.setTotalEnums((int) fileAnalyses.stream().flatMap(fa -> fa.getTypeDefinitions().stream()).filter(td -> "ENUM".equals(td.getType())).count());
            analysis.setTotalRecords((int) fileAnalyses.stream().flatMap(fa -> fa.getTypeDefinitions().stream()).filter(td -> "RECORD".equals(td.getType())).count());
            analysis.setTotalMethods(fileAnalyses.stream().mapToInt(fa -> fa.getTypeDefinitions().stream().mapToInt(td -> td.getMethodCount()).sum()).sum());
            analysis.setTotalFields(fileAnalyses.stream().mapToInt(fa -> fa.getTypeDefinitions().stream().mapToInt(td -> td.getFieldCount()).sum()).sum());
            analysis.setTotalConstructors(fileAnalyses.stream().mapToInt(fa -> fa.getTypeDefinitions().stream().mapToInt(td -> td.getConstructorCount()).sum()).sum());

            analysis.setStatus(AnalysisStatus.COMPLETED);
            analysisRepository.save(analysis);

            return analysis.getId();

        } catch (Exception e) {
            log.error("Analysis failed for project {}", projectId, e);
            analysis.setStatus(AnalysisStatus.FAILED);
            analysisRepository.save(analysis);
            throw new RuntimeException("Analysis failed", e); // Let global handler catch it
        }
    }

    @Transactional(readOnly = true)
    public ProjectAnalysis getAnalysis(UUID analysisId) {
        return analysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found with id: " + analysisId));
    }
}
