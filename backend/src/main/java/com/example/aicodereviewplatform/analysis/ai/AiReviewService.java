package com.example.aicodereviewplatform.analysis.ai;

import com.example.aicodereviewplatform.analysis.model.ProjectAnalysis;
import com.example.aicodereviewplatform.analysis.repository.ProjectAnalysisRepository;
import com.example.aicodereviewplatform.exception.AiReviewException;
import com.example.aicodereviewplatform.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service("projectAiReviewService")
@RequiredArgsConstructor
@Slf4j
public class AiReviewService {

    private final ProjectAnalysisRepository analysisRepository;
    private final ProjectSummaryGenerator summaryGenerator;
    private final SourceSelectionService sourceSelectionService;
    private final AiPromptBuilder promptBuilder;
    private final ChatClient chatClient;
    private final AiReviewRepository aiReviewRepository;
    private final AiReviewPersistenceService persistenceService;
    private final ReviewMapper mapper;

    @Value("${spring.ai.ollama.chat.options.model:qwen2.5-coder:7b}")
    private String defaultModel;

    @Transactional(readOnly = true)
    public String generatePromptForAnalysis(UUID analysisId) {
        log.info("Generating AI prompt for analysis ID: {}", analysisId);
        
        ProjectAnalysis analysis = analysisRepository.findByIdWithDetails(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("Project analysis not found with id: " + analysisId));
                
        ProjectSummary summary = summaryGenerator.generate(analysis);
        List<SelectedFile> selectedFiles = sourceSelectionService.selectFiles(analysis);
        
        String prompt = promptBuilder.buildPrompt(summary, selectedFiles);
        log.info("AI prompt generation completed. Length: {} chars", prompt.length());
        
        return prompt;
    }

    @Transactional
    public ReviewDTO generateReview(UUID analysisId) {
        log.info("Starting AI review generation for analysis ID: {}", analysisId);
        
        ProjectAnalysis analysis = analysisRepository.findByIdWithDetails(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("Project analysis not found with id: " + analysisId));
                
        // 1. Generate prompt using prompt builder
        ProjectSummary summary = summaryGenerator.generate(analysis);
        List<SelectedFile> selectedFiles = sourceSelectionService.selectFiles(analysis);
        String prompt = promptBuilder.buildPrompt(summary, selectedFiles);
        
        // 2. Initialize review record as IN_PROGRESS
        AiReview review = AiReview.builder()
                .id(UUID.randomUUID())
                .analysis(analysis)
                .model(defaultModel)
                .createdAt(LocalDateTime.now())
                .status(AiReviewStatus.IN_PROGRESS)
                .build();
                
        review = persistenceService.saveReviewInNewTransaction(review);
        
        long startTime = System.currentTimeMillis();
        try {
            log.info("Sending review prompt to Ollama (model: {})", defaultModel);
            var responseSpec = chatClient.prompt()
                    .user(prompt)
                    .call();
                    
            String content = responseSpec.content();
            var chatResponse = responseSpec.chatResponse();
            long executionTime = System.currentTimeMillis() - startTime;
            
            int promptTokens = 0;
            int completionTokens = 0;
            int totalTokens = 0;
            
            if (chatResponse != null && chatResponse.getMetadata() != null && chatResponse.getMetadata().getUsage() != null) {
                var usage = chatResponse.getMetadata().getUsage();
                if (usage.getPromptTokens() != null) {
                    promptTokens = usage.getPromptTokens().intValue();
                }
                if (usage.getGenerationTokens() != null) {
                    completionTokens = usage.getGenerationTokens().intValue();
                }
                totalTokens = promptTokens + completionTokens;
            } else {
                // Approximation
                promptTokens = (int) Math.ceil(prompt.length() / 4.0);
                completionTokens = (int) Math.ceil(content.length() / 4.0);
                totalTokens = promptTokens + completionTokens;
            }
            
            review.setStatus(AiReviewStatus.COMPLETED);
            review.setPromptTokens(promptTokens);
            review.setCompletionTokens(completionTokens);
            review.setTotalTokens(totalTokens);
            review.setExecutionTimeMs(executionTime);
            
            // Parse response content into sections
            List<ReviewSection> sections = parseSections(content, review);
            sections.forEach(review::addSection);
            
            review = persistenceService.saveReviewInNewTransaction(review);
            log.info("AI review generation completed and saved. ID: {}", review.getId());
            
            return mapper.toDto(review);
            
        } catch (Exception e) {
            log.error("Error during AI review generation: {}", e.getMessage(), e);
            long executionTime = System.currentTimeMillis() - startTime;
            
            review.setStatus(AiReviewStatus.FAILED);
            review.setExecutionTimeMs(executionTime);
            
            ReviewSection errorSection = ReviewSection.builder()
                    .id(UUID.randomUUID())
                    .review(review)
                    .title("Error Details")
                    .content("AI Review failed: " + e.getMessage())
                    .orderIndex(0)
                    .build();
            review.addSection(errorSection);
            
            persistenceService.saveReviewInNewTransaction(review);
            
            throw new AiReviewException("Failed to generate AI review due to network/Ollama error: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ReviewDTO getReview(UUID reviewId) {
        log.info("Fetching AI review with ID: {}", reviewId);
        AiReview review = aiReviewRepository.findByIdWithDetails(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("AI Review not found with id: " + reviewId));
        return mapper.toDto(review);
    }

    private List<ReviewSection> parseSections(String content, AiReview review) {
        List<ReviewSection> sections = new ArrayList<>();
        // Split content by markdown headings (e.g., #, ##, ###)
        String[] parts = content.split("(?m)^(?=(?:##|###|#)\\s+)");
        
        int orderIndex = 0;
        for (String part : parts) {
            String trimmedPart = part.trim();
            if (trimmedPart.isEmpty()) {
                continue;
            }
            
            // Check if it starts with a heading
            if (trimmedPart.startsWith("#")) {
                // Find first newline
                int newlineIdx = trimmedPart.indexOf('\n');
                String headerLine;
                String sectionContent;
                if (newlineIdx != -1) {
                    headerLine = trimmedPart.substring(0, newlineIdx).trim();
                    sectionContent = trimmedPart.substring(newlineIdx).trim();
                } else {
                    headerLine = trimmedPart;
                    sectionContent = "";
                }
                
                // Clean header line from # characters
                String title = headerLine.replaceAll("^#+\\s+", "").trim();
                if (!title.isEmpty()) {
                    sections.add(ReviewSection.builder()
                            .id(UUID.randomUUID())
                            .review(review)
                            .title(title)
                            .content(sectionContent)
                            .orderIndex(orderIndex++)
                            .build());
                }
            } else {
                // Content before any heading (fallback/intro)
                sections.add(ReviewSection.builder()
                        .id(UUID.randomUUID())
                        .review(review)
                        .title("Introduction")
                        .content(trimmedPart)
                        .orderIndex(orderIndex++)
                        .build());
            }
        }
        
        if (sections.isEmpty()) {
            sections.add(ReviewSection.builder()
                    .id(UUID.randomUUID())
                    .review(review)
                    .title("Detailed Review")
                    .content(content)
                    .orderIndex(0)
                    .build());
        }
        
        return sections;
    }
}
