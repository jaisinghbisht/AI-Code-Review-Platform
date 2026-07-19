package com.example.aicodereviewplatform.analysis.controller;

import com.example.aicodereviewplatform.analysis.dto.AnalysisDTO;
import com.example.aicodereviewplatform.analysis.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/{projectId}")
    public ResponseEntity<Map<String, UUID>> runAnalysis(@PathVariable UUID projectId) {
        UUID analysisId = analysisService.runAnalysis(projectId);
        return ResponseEntity.ok(Map.of("analysisId", analysisId));
    }

    @GetMapping("/{analysisId}")
    public ResponseEntity<AnalysisDTO> getAnalysis(@PathVariable UUID analysisId) {
        AnalysisDTO analysis = analysisService.getAnalysis(analysisId);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<java.util.List<AnalysisDTO>> getAnalysesByProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(analysisService.getAnalysesByProject(projectId));
    }
}
