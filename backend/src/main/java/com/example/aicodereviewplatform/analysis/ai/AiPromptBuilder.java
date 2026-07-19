package com.example.aicodereviewplatform.analysis.ai;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AiPromptBuilder {

    private final ReviewFormatter formatter;

    public AiPromptBuilder(ReviewFormatter formatter) {
        this.formatter = formatter;
    }

    public String buildPrompt(ProjectSummary summary, List<SelectedFile> selectedFiles) {
        StringBuilder sb = new StringBuilder();
        
        // 1. System Instructions
        sb.append("# SYSTEM INSTRUCTIONS\n");
        sb.append("You are an enterprise-grade AI Code Review Engine.\n");
        sb.append("Analyze the provided project metadata, architecture, metrics, and source code.\n");
        sb.append("Provide a comprehensive code review focusing on:\n");
        sb.append("- Security vulnerabilities (e.g. SQL injection, unsafe inputs, credentials leak)\n");
        sb.append("- Performance bottlenecks (e.g. redundant DB calls, N+1 query issue, inefficient loops)\n");
        sb.append("- Architectural compliance and SOLID violations\n");
        sb.append("- Code complexity, maintainability, and clean code suggestions\n\n");
        sb.append("Format your response in structured Markdown. You MUST organize your review into the following sections using exact '##' headings:\n");
        sb.append("## Architecture\n");
        sb.append("## SOLID\n");
        sb.append("## Code Smells\n");
        sb.append("## Maintainability\n");
        sb.append("## Performance\n");
        sb.append("## Security\n");
        sb.append("## Naming\n");
        sb.append("## Spring Boot Best Practices\n");
        sb.append("## Refactoring Suggestions\n");
        sb.append("## Potential Bugs\n");
        sb.append("## Testing Recommendations\n\n");
        sb.append("For each section, provide specific, highly actionable recommendations (with code snippet examples where appropriate) rather than generic advice. If a section has no comments, write \"No issues detected.\" or similar, but keep the heading.\n\n");
        sb.append("========================================================================\n\n");

        // 2. Project Summary & Overview
        sb.append(formatter.formatProjectOverview(summary));
        
        // 3. Metrics
        sb.append(formatter.formatMetrics(summary));
        
        // 4. Package Summary
        sb.append(formatter.formatPackageSummary(summary));
        
        // 5. Largest Classes
        sb.append(formatter.formatLargestClasses(summary));
        
        // 6. Architectural Observations
        sb.append(formatter.formatArchitecturalObservations(summary));
        
        // 7. Complexity Observations
        sb.append(formatter.formatComplexityObservations(summary));
        
        // 8. Important Classes
        sb.append(formatter.formatImportantClasses(summary));
        
        // 9. Selected Source Code Snippets
        sb.append(formatter.formatSelectedFiles(selectedFiles));
        
        sb.append("\n========================================================================\n\n");
        
        // 10. Review Objectives
        sb.append("# REVIEW OBJECTIVES\n");
        sb.append("Please provide a thorough critique of the selected source code files including:\n");
        sb.append("1. **Critical issues**: Bugs or errors that could cause runtime failures.\n");
        sb.append("2. **Security concerns**: Issues that could expose the application to threats.\n");
        sb.append("3. **Code quality improvements**: Readability, refactoring, and clean code enhancements.\n");
        sb.append("4. **Positive aspects**: Good practices that should be commended.\n");

        return sb.toString();
    }
}
