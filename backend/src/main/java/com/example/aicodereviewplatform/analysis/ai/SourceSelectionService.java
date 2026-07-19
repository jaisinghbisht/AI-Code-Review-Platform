package com.example.aicodereviewplatform.analysis.ai;

import com.example.aicodereviewplatform.analysis.model.ProjectAnalysis;
import java.util.List;

public interface SourceSelectionService {
    List<SelectedFile> selectFiles(ProjectAnalysis analysis);
}
