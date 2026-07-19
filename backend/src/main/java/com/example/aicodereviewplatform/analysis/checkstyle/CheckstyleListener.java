package com.example.aicodereviewplatform.analysis.checkstyle;

import com.example.aicodereviewplatform.analysis.model.CheckstyleViolation;
import com.example.aicodereviewplatform.analysis.model.FileAnalysis;
import com.puppycrawl.tools.checkstyle.api.AuditEvent;
import com.puppycrawl.tools.checkstyle.api.AuditListener;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class CheckstyleListener implements AuditListener {

    private final List<FileAnalysis> fileAnalyses;

    @Override
    public void auditStarted(AuditEvent event) {
        // Not needed
    }

    @Override
    public void auditFinished(AuditEvent event) {
        // Not needed
    }

    @Override
    public void fileStarted(AuditEvent event) {
        // Not needed
    }

    @Override
    public void fileFinished(AuditEvent event) {
        // Not needed
    }

    @Override
    public void addError(AuditEvent event) {
        fileAnalyses.stream()
                .filter(fa -> fa.getFilePath().endsWith(event.getFileName()))
                .findFirst()
                .ifPresent(fileAnalysis -> {
                    CheckstyleViolation violation = CheckstyleViolation.builder()
                            .id(UUID.randomUUID())
                            .sourceName(event.getSourceName())
                            .severity(event.getSeverityLevel().getName())
                            .line(event.getLine())
                            .columnNum(event.getColumn())
                            .message(event.getMessage())
                            .build();
                    fileAnalysis.addCheckstyleViolation(violation);
                });
    }

    @Override
    public void addException(AuditEvent event, Throwable throwable) {
        // Not needed
    }
}
