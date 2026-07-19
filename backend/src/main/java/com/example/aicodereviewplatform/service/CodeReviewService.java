package com.example.aicodereviewplatform.service;

import com.example.aicodereviewplatform.dto.CodeReviewResponse;
import com.example.aicodereviewplatform.dto.CodeReviewResult;
import com.example.aicodereviewplatform.entity.CodeReview;
import com.example.aicodereviewplatform.entity.CodeSubmission;
import com.example.aicodereviewplatform.exception.ResourceNotFoundException;
import com.example.aicodereviewplatform.repository.CodeReviewRepository;
import com.example.aicodereviewplatform.repository.CodeSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CodeReviewService {

    private final CodeReviewRepository codeReviewRepository;
    private final CodeSubmissionRepository codeSubmissionRepository;
    private final AiReviewService aiReviewService;

    @Transactional
    public void generateReview(Long submissionId) {
        CodeSubmission submission = codeSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + submissionId));

        CodeReviewResult result = aiReviewService.getReview(submission.getSourceCode());

        CodeReview review = CodeReview.builder()
                .submission(submission)
                .bugs(result.getBugs())
                .securityIssues(result.getSecurityIssues())
                .performanceIssues(result.getPerformanceIssues())
                .maintainabilityIssues(result.getMaintainabilityIssues())
                .refactoringSuggestions(result.getRefactoringSuggestions())
                .overallSummary(result.getOverallSummary())
                .createdAt(LocalDateTime.now())
                .build();

        codeReviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public CodeReviewResponse getReview(Long submissionId) {
        CodeReview review = codeReviewRepository.findBySubmissionId(submissionId).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Review not found for submission ID: " + submissionId));
        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<CodeReviewResponse> getReviewHistory() {
        return codeReviewRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CodeReviewResponse toResponse(CodeReview review) {
        return CodeReviewResponse.builder()
                .id(review.getId())
                .submissionId(review.getSubmission().getId())
                .bugs(review.getBugs())
                .securityIssues(review.getSecurityIssues())
                .performanceIssues(review.getPerformanceIssues())
                .maintainabilityIssues(review.getMaintainabilityIssues())
                .refactoringSuggestions(review.getRefactoringSuggestions())
                .overallSummary(review.getOverallSummary())
                .createdAt(review.getCreatedAt())
                .build();
    }
}