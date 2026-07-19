package com.example.aicodereviewplatform.analysis.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class AiReviewController {

    private final AiReviewService aiReviewService;

    @PostMapping("/prompt/{analysisId}")
    public ResponseEntity<AiPromptResponse> generatePrompt(@PathVariable UUID analysisId) {
        log.info("Received request to generate AI prompt for analysis: {}", analysisId);
        
        String prompt = aiReviewService.generatePromptForAnalysis(analysisId);
        
        // Estimate token count based on typical character-to-token ratio (~4 chars per token)
        int estimatedTokens = (int) Math.ceil(prompt.length() / 4.0);
        
        AiPromptResponse response = new AiPromptResponse(analysisId, prompt, estimatedTokens);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{analysisId:[a-fA-F0-9\\-]{36}}")
    public ResponseEntity<ReviewDTO> generateReview(@PathVariable UUID analysisId) {
        log.info("Received request to generate AI review for analysis: {}", analysisId);
        ReviewDTO review = aiReviewService.generateReview(analysisId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/{reviewId:[a-fA-F0-9\\-]{36}}")
    public ResponseEntity<ReviewDTO> getReview(@PathVariable UUID reviewId) {
        log.info("Received request to fetch AI review: {}", reviewId);
        ReviewDTO review = aiReviewService.getReview(reviewId);
        return ResponseEntity.ok(review);
    }
}
