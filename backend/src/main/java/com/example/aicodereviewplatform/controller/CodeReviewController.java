package com.example.aicodereviewplatform.controller;

import com.example.aicodereviewplatform.dto.CodeReviewResponse;
import com.example.aicodereviewplatform.service.CodeReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class CodeReviewController {

    private final CodeReviewService codeReviewService;

    @PostMapping("/{submissionId:[0-9]+}")
    public ResponseEntity<Void> generateReview(@PathVariable Long submissionId) {
        codeReviewService.generateReview(submissionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{submissionId:[0-9]+}")
    public ResponseEntity<CodeReviewResponse> getReview(@PathVariable Long submissionId) {
        return ResponseEntity.ok(codeReviewService.getReview(submissionId));
    }

    @GetMapping("/history")
    public ResponseEntity<List<CodeReviewResponse>> getReviewHistory() {
        return ResponseEntity.ok(codeReviewService.getReviewHistory());
    }
}