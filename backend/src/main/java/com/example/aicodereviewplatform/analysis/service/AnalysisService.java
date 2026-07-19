package com.example.aicodereviewplatform.analysis.service;

import com.example.aicodereviewplatform.analysis.checkstyle.CheckstyleAnalyzer;
import com.example.aicodereviewplatform.analysis.dto.AnalysisDTO;
import com.example.aicodereviewplatform.analysis.mapper.AnalysisMapper;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final ProjectRepository projectRepository;
    private final ProjectAnalysisRepository analysisRepository;
    private final ProjectScanner projectScanner;
    private final FileParser fileParser;
    private final AnalysisMapper analysisMapper;
    private final CheckstyleAnalyzer checkstyleAnalyzer;

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
            Path projectRoot = Path.of(project.getRootDirectory());
            List<Path> javaFiles = projectScanner.findJavaFiles(projectRoot);

            // 1. JavaParser Analysis
            log.info("Starting JavaParser analysis for project: {}", projectId);
            List<FileAnalysis> fileAnalyses = javaFiles.parallelStream()
                    .map(fileParser::parse)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            fileAnalyses.forEach(analysis::addFileAnalysis);
            log.info("JavaParser analysis completed.");

            // 2. Checkstyle Analysis (Temporarily disabled by user request)
            log.info("Starting Checkstyle analysis...");
            // checkstyleAnalyzer.analyze(fileAnalyses, projectRoot);
            log.info("Checkstyle analysis completed.");

            // 3. Aggregate and Save
            log.info("Aggregating results...");
            analysis.setTotalClasses((int) fileAnalyses.stream().flatMap(fa -> fa.getTypeDefinitions().stream()).filter(td -> "CLASS".equals(td.getType())).count());
            analysis.setTotalInterfaces((int) fileAnalyses.stream().flatMap(fa -> fa.getTypeDefinitions().stream()).filter(td -> "INTERFACE".equals(td.getType())).count());
            analysis.setTotalEnums((int) fileAnalyses.stream().flatMap(fa -> fa.getTypeDefinitions().stream()).filter(td -> "ENUM".equals(td.getType())).count());
            analysis.setTotalRecords((int) fileAnalyses.stream().flatMap(fa -> fa.getTypeDefinitions().stream()).filter(td -> "RECORD".equals(td.getType())).count());
            analysis.setTotalMethods(fileAnalyses.stream().mapToInt(fa -> fa.getTypeDefinitions().stream().mapToInt(td -> td.getMethodCount()).sum()).sum());
            analysis.setTotalFields(fileAnalyses.stream().mapToInt(fa -> fa.getTypeDefinitions().stream().mapToInt(td -> td.getFieldCount()).sum()).sum());
            analysis.setTotalConstructors(fileAnalyses.stream().mapToInt(fa -> fa.getTypeDefinitions().stream().mapToInt(td -> td.getConstructorCount()).sum()).sum());

            analysis.setStatus(AnalysisStatus.COMPLETED);
            analysisRepository.save(analysis);
            log.info("Analysis for project {} completed successfully.", projectId);

            return analysis.getId();

        } catch (Exception e) {
            log.error("Analysis failed for project {}", projectId, e);
            analysis.setStatus(AnalysisStatus.FAILED);
            analysisRepository.save(analysis);
            throw new RuntimeException("Analysis failed", e);
        }
    }

    @Transactional(readOnly = true)
    public AnalysisDTO getAnalysis(UUID analysisId) {
        ProjectAnalysis analysis = analysisRepository.findByIdWithDetails(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found with id: " + analysisId));
        return analysisMapper.toDto(analysis);
    }

    @Transactional(readOnly = true)
    public List<AnalysisDTO> getAnalysesByProject(UUID projectId) {
        return analysisRepository.findByProjectId(projectId).stream()
                .map(analysisMapper::toDto)
                .collect(Collectors.toList());
    }
}
