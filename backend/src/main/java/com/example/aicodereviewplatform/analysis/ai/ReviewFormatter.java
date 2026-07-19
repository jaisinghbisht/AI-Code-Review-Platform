package com.example.aicodereviewplatform.analysis.ai;

import java.util.List;

public interface ReviewFormatter {
    String formatProjectOverview(ProjectSummary summary);
    String formatMetrics(ProjectSummary summary);
    String formatPackageSummary(ProjectSummary summary);
    String formatLargestClasses(ProjectSummary summary);
    String formatArchitecturalObservations(ProjectSummary summary);
    String formatComplexityObservations(ProjectSummary summary);
    String formatImportantClasses(ProjectSummary summary);
    String formatSelectedFiles(List<SelectedFile> selectedFiles);
}
