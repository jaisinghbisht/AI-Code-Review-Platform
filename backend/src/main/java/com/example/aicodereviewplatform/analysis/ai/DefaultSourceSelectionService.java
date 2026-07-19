package com.example.aicodereviewplatform.analysis.ai;

import com.example.aicodereviewplatform.analysis.model.FileAnalysis;
import com.example.aicodereviewplatform.analysis.model.ProjectAnalysis;
import com.example.aicodereviewplatform.analysis.model.TypeDefinition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
@Slf4j
public class DefaultSourceSelectionService implements SourceSelectionService {

    private final int topNClasses;
    private final int lineThreshold;
    private final int methodThreshold;

    public DefaultSourceSelectionService(
            @Value("${app.analysis.ai.selection.top-n-classes:5}") int topNClasses,
            @Value("${app.analysis.ai.selection.line-threshold:200}") int lineThreshold,
            @Value("${app.analysis.ai.selection.method-threshold:15}") int methodThreshold) {
        this.topNClasses = topNClasses;
        this.lineThreshold = lineThreshold;
        this.methodThreshold = methodThreshold;
    }

    @Override
    public List<SelectedFile> selectFiles(ProjectAnalysis analysis) {
        Set<FileAnalysis> fileAnalyses = analysis.getFileAnalyses();
        if (fileAnalyses == null || fileAnalyses.isEmpty()) {
            return Collections.emptyList();
        }

        // Keep track of unique files to select
        Set<FileAnalysis> selectedFilesSet = new LinkedHashSet<>();

        // 1. Find all TypeDefinitions and sort by line count descending
        List<TypeDefinition> allTypes = fileAnalyses.stream()
                .flatMap(fa -> fa.getTypeDefinitions().stream())
                .filter(td -> "CLASS".equals(td.getType()))
                .sorted(Comparator.comparingInt(TypeDefinition::getLineCount).reversed())
                .toList();

        // 2. Select top N largest classes
        for (int i = 0; i < Math.min(topNClasses, allTypes.size()); i++) {
            TypeDefinition td = allTypes.get(i);
            if (td.getFileAnalysis() != null) {
                selectedFilesSet.add(td.getFileAnalysis());
            }
        }

        // 3. Select classes exceeding configurable thresholds
        for (TypeDefinition td : allTypes) {
            if (td.getLineCount() >= lineThreshold || td.getMethodCount() >= methodThreshold) {
                if (td.getFileAnalysis() != null) {
                    selectedFilesSet.add(td.getFileAnalysis());
                }
            }
        }

        // 4. Map selected FileAnalysis entities to SelectedFile objects containing source code
        List<SelectedFile> selectedFiles = new ArrayList<>();
        for (FileAnalysis fa : selectedFilesSet) {
            String filePath = fa.getFilePath();
            String className = fa.getTypeDefinitions().stream()
                    .filter(td -> "CLASS".equals(td.getType()))
                    .findFirst()
                    .map(TypeDefinition::getTypeName)
                    .orElse("UnknownClass");

            try {
                Path path = Path.of(filePath);
                if (Files.exists(path) && Files.isReadable(path)) {
                    String sourceCode = Files.readString(path);
                    selectedFiles.add(new SelectedFile(filePath, className, sourceCode));
                } else {
                    log.warn("Source file not found or unreadable on disk: {}", filePath);
                }
            } catch (IOException e) {
                log.error("Failed to read source file from disk: {}", filePath, e);
            }
        }

        return selectedFiles;
    }
}
