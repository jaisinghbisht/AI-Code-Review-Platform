package com.example.aicodereviewplatform.analysis.controller;

import com.example.aicodereviewplatform.analysis.dto.AnalysisJobProgress;
import com.example.aicodereviewplatform.analysis.service.AnalysisProgressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobController {

    private final AnalysisProgressService progressService;

    @GetMapping("/{jobId}")
    public ResponseEntity<AnalysisJobProgress> getJobStatus(@PathVariable UUID jobId) {
        log.info("Fetching status for job ID: {}", jobId);
        AnalysisJobProgress progress = progressService.getJobProgress(jobId);
        if (progress == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(progress);
    }

    @GetMapping(value = "/{jobId}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getJobEvents(@PathVariable UUID jobId) {
        log.info("Subscribed to event stream for job ID: {}", jobId);
        return progressService.registerEmitter(jobId);
    }
}
