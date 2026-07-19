package com.example.aicodereviewplatform.analysis.service;

import com.example.aicodereviewplatform.analysis.dto.AnalysisJobProgress;
import com.example.aicodereviewplatform.analysis.model.AnalysisJobStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class AnalysisProgressService {

    private final Map<UUID, AnalysisJobProgress> jobProgressMap = new ConcurrentHashMap<>();
    private final Map<UUID, List<SseEmitter>> emittersMap = new ConcurrentHashMap<>();

    public AnalysisJobProgress createJob(UUID jobId, UUID projectId) {
        AnalysisJobProgress progress = AnalysisJobProgress.builder()
                .jobId(jobId)
                .projectId(projectId)
                .status(AnalysisJobStatus.QUEUED)
                .percentage(0)
                .currentStep("Queued in processing pool")
                .startedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .estimatedRemainingMs(25000L) // Initial estimate (e.g. 25s)
                .build();
        jobProgressMap.put(jobId, progress);
        return progress;
    }

    public void updateProgress(UUID jobId, AnalysisJobStatus status, int percentage, String currentStep, Long estimatedRemainingMs) {
        AnalysisJobProgress progress = jobProgressMap.get(jobId);
        if (progress != null) {
            synchronized (progress) {
                progress.setStatus(status);
                progress.setPercentage(percentage);
                progress.setCurrentStep(currentStep);
                progress.setUpdatedAt(LocalDateTime.now());
                progress.setEstimatedRemainingMs(estimatedRemainingMs);
            }
            broadcast(jobId, progress);
        }
    }

    public void failJob(UUID jobId, String errorMessage) {
        log.error("Job {} failed: {}", jobId, errorMessage);
        AnalysisJobProgress progress = jobProgressMap.get(jobId);
        if (progress != null) {
            synchronized (progress) {
                progress.setStatus(AnalysisJobStatus.FAILED);
                progress.setErrorMessage(errorMessage);
                progress.setUpdatedAt(LocalDateTime.now());
                progress.setEstimatedRemainingMs(0L);
            }
            broadcast(jobId, progress);
            completeEmitters(jobId);
        }
    }

    public void completeJob(UUID jobId) {
        log.info("Job {} completed successfully", jobId);
        AnalysisJobProgress progress = jobProgressMap.get(jobId);
        if (progress != null) {
            synchronized (progress) {
                progress.setStatus(AnalysisJobStatus.COMPLETED);
                progress.setPercentage(100);
                progress.setCurrentStep("Review generation completed successfully.");
                progress.setUpdatedAt(LocalDateTime.now());
                progress.setEstimatedRemainingMs(0L);
            }
            broadcast(jobId, progress);
            completeEmitters(jobId);
        }
    }

    public AnalysisJobProgress getJobProgress(UUID jobId) {
        return jobProgressMap.get(jobId);
    }

    public SseEmitter registerEmitter(UUID jobId) {
        // Emitter with 30-minute timeout
        SseEmitter emitter = new SseEmitter(1800000L);
        
        List<SseEmitter> emitters = emittersMap.computeIfAbsent(jobId, k -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((ex) -> emitters.remove(emitter));

        // Send current progress immediately to let the client align
        AnalysisJobProgress currentProgress = jobProgressMap.get(jobId);
        if (currentProgress != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("progress")
                        .data(currentProgress));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }

        return emitter;
    }

    private void broadcast(UUID jobId, AnalysisJobProgress progress) {
        List<SseEmitter> emitters = emittersMap.get(jobId);
        if (emitters != null) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("progress")
                            .data(progress));
                } catch (Exception e) {
                    emitters.remove(emitter);
                }
            }
        }
    }

    private void completeEmitters(UUID jobId) {
        List<SseEmitter> emitters = emittersMap.remove(jobId);
        if (emitters != null) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.complete();
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
    }
}
