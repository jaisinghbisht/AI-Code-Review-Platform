package com.example.aicodereviewplatform.analysis.ai;

import com.example.aicodereviewplatform.analysis.model.FileAnalysis;
import com.example.aicodereviewplatform.analysis.model.ProjectAnalysis;
import com.example.aicodereviewplatform.analysis.model.TypeDefinition;
import com.example.aicodereviewplatform.project.model.Project;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class ProjectSummaryGenerator {

    private final int topNFilesLimit;
    private final int manyMethodsThreshold;

    public ProjectSummaryGenerator(
            @Value("${app.analysis.ai.top-n-files-limit:5}") int topNFilesLimit,
            @Value("${app.analysis.ai.many-methods-threshold:15}") int manyMethodsThreshold) {
        this.topNFilesLimit = topNFilesLimit;
        this.manyMethodsThreshold = manyMethodsThreshold;
    }

    public ProjectSummary generate(ProjectAnalysis analysis) {
        Project project = analysis.getProject();
        
        // 1. Project Type
        String projectType = determineProjectType(project);
        
        // 2. Packages Discovered
        Set<String> packagesDiscovered = analysis.getFileAnalyses().stream()
                .map(FileAnalysis::getPackageName)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
                
        // 3. Average methods per class
        double averageMethodsPerClass = 0.0;
        if (analysis.getTotalClasses() > 0) {
            averageMethodsPerClass = (double) analysis.getTotalMethods() / analysis.getTotalClasses();
        }
        
        // Collect all type definitions from file analyses
        List<TypeDefinition> allTypes = analysis.getFileAnalyses().stream()
                .flatMap(fa -> fa.getTypeDefinitions().stream())
                .toList();
                
        // 4. Largest classes (by line count)
        List<TypeSummary> largestClasses = allTypes.stream()
                .filter(t -> "CLASS".equals(t.getType()))
                .sorted(Comparator.comparingInt(TypeDefinition::getLineCount).reversed())
                .limit(topNFilesLimit)
                .map(this::toTypeSummary)
                .toList();
                
        // 5. Top N largest files (by line count)
        List<FileSummary> topNLargestFiles = analysis.getFileAnalyses().stream()
                .sorted(Comparator.comparingInt(FileAnalysis::getLineCount).reversed())
                .limit(topNFilesLimit)
                .map(this::toFileSummary)
                .toList();
                
        // 6. Classes with many methods (methodCount > threshold)
        List<TypeSummary> classesWithManyMethods = allTypes.stream()
                .filter(t -> "CLASS".equals(t.getType()) && t.getMethodCount() > manyMethodsThreshold)
                .sorted(Comparator.comparingInt(TypeDefinition::getMethodCount).reversed())
                .map(this::toTypeSummary)
                .toList();
                
        // 7. Classes without methods (methodCount == 0)
        List<TypeSummary> classesWithoutMethods = allTypes.stream()
                .filter(t -> "CLASS".equals(t.getType()) && t.getMethodCount() == 0)
                .map(this::toTypeSummary)
                .toList();
                
        // 8. General observations
        List<String> generalObservations = generateObservations(analysis, project, allTypes);
        
        return new ProjectSummary(
                project.getProjectName(),
                projectType,
                project.getTotalFiles(),
                project.getJavaFiles(),
                project.getPackageCount(),
                analysis.getTotalClasses(),
                analysis.getTotalInterfaces(),
                analysis.getTotalEnums(),
                analysis.getTotalRecords(),
                analysis.getTotalMethods(),
                analysis.getTotalFields(),
                analysis.getTotalConstructors(),
                packagesDiscovered,
                averageMethodsPerClass,
                largestClasses,
                topNLargestFiles,
                classesWithManyMethods,
                classesWithoutMethods,
                generalObservations
        );
    }
    
    private String determineProjectType(Project project) {
        List<String> components = new ArrayList<>();
        if (project.isSpringBootProject()) {
            components.add("Spring Boot");
        }
        if (project.isMavenProject()) {
            components.add("Maven");
        }
        if (project.isGradleProject()) {
            components.add("Gradle");
        }
        if (components.isEmpty()) {
            components.add("Pure Java");
        }
        return String.join(", ", components);
    }
    
    private TypeSummary toTypeSummary(TypeDefinition typeDef) {
        String filePath = typeDef.getFileAnalysis() != null ? typeDef.getFileAnalysis().getFilePath() : "Unknown";
        return new TypeSummary(
                typeDef.getTypeName(),
                typeDef.getType(),
                filePath,
                typeDef.getLineCount(),
                typeDef.getMethodCount(),
                typeDef.getFieldCount()
        );
    }
    
    private FileSummary toFileSummary(FileAnalysis fileAnalysis) {
        int violationsCount = fileAnalysis.getCheckstyleViolations() != null ? fileAnalysis.getCheckstyleViolations().size() : 0;
        return new FileSummary(
                fileAnalysis.getFilePath(),
                fileAnalysis.getLineCount(),
                violationsCount
        );
    }
    
    private List<String> generateObservations(ProjectAnalysis analysis, Project project, List<TypeDefinition> allTypes) {
        List<String> observations = new ArrayList<>();
        
        long totalViolations = analysis.getFileAnalyses().stream()
                .mapToLong(fa -> fa.getCheckstyleViolations().size())
                .sum();
                
        observations.add("Project has " + project.getJavaFiles() + " Java files across " + project.getPackageCount() + " packages.");
        
        if (totalViolations > 0) {
            observations.add("Discovered " + totalViolations + " checkstyle violations. Code styling improvements may be needed.");
        } else {
            observations.add("No checkstyle violations found. Code adheres well to stylistic rules.");
        }
        
        if (analysis.getTotalClasses() > 0) {
            long abstractCount = allTypes.stream().filter(t -> "CLASS".equals(t.getType()) && t.isAbstract()).count();
            if (abstractCount > 0) {
                observations.add("Discovered " + abstractCount + " abstract classes, indicating use of polymorphism / inheritance.");
            }
        }
        
        long springBootCount = allTypes.stream()
                .filter(t -> t.getTypeName() != null && t.getTypeName().endsWith("Application"))
                .count();
        if (project.isSpringBootProject() || springBootCount > 0) {
            observations.add("This is a Spring Boot application. Architecture review should focus on controllers, services, and repositories.");
        }
        
        return observations;
    }
}
