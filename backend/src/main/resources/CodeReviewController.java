package com.example.aicodereviewplatform.controller;

import com.example.aicodereviewplatform.dto.CodeReviewResponse;
import com.example.aicodereviewplatform.service.CodeReviewService;
import io.github.ollama4j.exceptions.OllamaBaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class CodeReviewController {

    private final CodeReviewService codeReviewService;

    @PostMapping("/{submissionId}")
    public ResponseEntity<Void> generateReview(@PathVariable Long submissionId) {
        try {
            codeReviewService.generateReview(submissionId);
            return ResponseEntity.ok().build();
        } catch (OllamaBaseException | IOException e) {
            // Proper exception handling should be implemented
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<CodeReviewResponse> getReview(@PathVariable Long submissionId) {
        return ResponseEntity.ok(codeReviewService.getReview(submissionId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<CodeReviewResponse>> getReviewHistory() {
        return ResponseEntity.ok(codeReviewService.getReviewHistory());
    }
}
