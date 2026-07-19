package com.example.aicodereviewplatform.analysis.ai;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MarkdownReviewFormatter implements ReviewFormatter {

    @Override
    public String formatProjectOverview(ProjectSummary summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Project Overview\n");
        sb.append(String.format("- **Project Name**: %s\n", summary.projectName()));
        sb.append(String.format("- **Project Type**: %s\n", summary.projectType()));
        sb.append(String.format("- **Total Discovered Packages**: %d\n", summary.packageCount()));
        sb.append("\n");
        return sb.toString();
    }

    @Override
    public String formatMetrics(ProjectSummary summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Project Metrics\n");
        sb.append(String.format("- **Total Files**: %d\n", summary.totalFiles()));
        sb.append(String.format("- **Java Files**: %d\n", summary.javaFiles()));
        sb.append(String.format("- **Total Classes**: %d\n", summary.classesCount()));
        sb.append(String.format("- **Total Interfaces**: %d\n", summary.interfacesCount()));
        sb.append(String.format("- **Total Enums**: %d\n", summary.enumsCount()));
        sb.append(String.format("- **Total Records**: %d\n", summary.recordsCount()));
        sb.append(String.format("- **Total Methods**: %d\n", summary.methodsCount()));
        sb.append(String.format("- **Total Constructors**: %d\n", summary.constructorsCount()));
        sb.append(String.format("- **Average Methods per Class**: %.2f\n", summary.averageMethodsPerClass()));
        sb.append("\n");
        return sb.toString();
    }

    @Override
    public String formatPackageSummary(ProjectSummary summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Package Summary\n");
        if (summary.packagesDiscovered().isEmpty()) {
            sb.append("No Java packages discovered.\n");
        } else {
            sb.append("The following packages were discovered in the codebase:\n");
            for (String pkg : summary.packagesDiscovered().stream().sorted().toList()) {
                sb.append(String.format("- `%s`\n", pkg));
            }
        }
        sb.append("\n");
        return sb.toString();
    }

    @Override
    public String formatLargestClasses(ProjectSummary summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Largest Classes (by lines of code)\n");
        if (summary.largestClasses().isEmpty()) {
            sb.append("No classes found.\n");
        } else {
            for (TypeSummary ts : summary.largestClasses()) {
                sb.append(String.format("- **%s** (%d lines of code, %d methods)\n", 
                        ts.typeName(), ts.lineCount(), ts.methodCount()));
            }
        }
        sb.append("\n");
        return sb.toString();
    }

    @Override
    public String formatArchitecturalObservations(ProjectSummary summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Architectural Observations\n");
        for (String obs : summary.generalObservations()) {
            sb.append(String.format("- %s\n", obs));
        }
        sb.append("\n");
        return sb.toString();
    }

    @Override
    public String formatComplexityObservations(ProjectSummary summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Complexity Observations\n");
        
        List<String> observations = new ArrayList<>();
        if (!summary.classesWithManyMethods().isEmpty()) {
            observations.add(String.format("Found %d class(es) with high method count (> threshold):", summary.classesWithManyMethods().size()));
            for (TypeSummary ts : summary.classesWithManyMethods()) {
                observations.add(String.format("  - Class `%s` has %d methods (Location: `%s`)", ts.typeName(), ts.methodCount(), ts.filePath()));
            }
        }
        
        if (!summary.classesWithoutMethods().isEmpty()) {
            observations.add(String.format("Found %d class(es) without any methods (possibly data-holders or entities):", summary.classesWithoutMethods().size()));
            for (TypeSummary ts : summary.classesWithoutMethods()) {
                observations.add(String.format("  - Class `%s` (Location: `%s`)", ts.typeName(), ts.filePath()));
            }
        }
        
        if (summary.averageMethodsPerClass() > 10.0) {
            observations.add(String.format("Average methods per class is %.2f, which suggests complex or large classes on average.", summary.averageMethodsPerClass()));
        }
        
        if (observations.isEmpty()) {
            sb.append("No significant complexity issues or class layout anomalies detected.\n");
        } else {
            for (String obs : observations) {
                sb.append(obs).append("\n");
            }
        }
        sb.append("\n");
        return sb.toString();
    }

    @Override
    public String formatImportantClasses(ProjectSummary summary) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Important Classes\n");
        
        List<TypeSummary> importantList = new ArrayList<>();
        // Gather key classes: applications, controllers, services
        for (TypeSummary ts : summary.largestClasses()) {
            String name = ts.typeName();
            if (name.endsWith("Application") || name.endsWith("Controller") || name.endsWith("Service") || name.endsWith("Repository")) {
                importantList.add(ts);
            }
        }
        
        if (importantList.isEmpty() && !summary.largestClasses().isEmpty()) {
            // fallback to top 2 largest
            importantList.add(summary.largestClasses().get(0));
            if (summary.largestClasses().size() > 1) {
                importantList.add(summary.largestClasses().get(1));
            }
        }
        
        if (importantList.isEmpty()) {
            sb.append("No key classes identified.\n");
        } else {
            sb.append("Key classes identified for focused review:\n");
            for (TypeSummary ts : importantList) {
                sb.append(String.format("- **%s** (`%s`): %d LOC, %d fields, %d methods\n", 
                        ts.typeName(), ts.filePath(), ts.lineCount(), ts.fieldCount(), ts.methodCount()));
            }
        }
        sb.append("\n");
        return sb.toString();
    }

    @Override
    public String formatSelectedFiles(List<SelectedFile> selectedFiles) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Selected Source Code Snippets\n");
        if (selectedFiles.isEmpty()) {
            sb.append("No source files selected for review.\n");
        } else {
            sb.append("The following files have been selected for deep analysis based on size and complexity metrics:\n\n");
            for (SelectedFile sf : selectedFiles) {
                sb.append(String.format("#### File: `%s` (Class: `%s`)\n", sf.filePath(), sf.className()));
                sb.append("```java\n");
                sb.append(sf.sourceCode());
                if (!sf.sourceCode().endsWith("\n")) {
                    sb.append("\n");
                }
                sb.append("```\n\n");
            }
        }
        return sb.toString();
    }
}
