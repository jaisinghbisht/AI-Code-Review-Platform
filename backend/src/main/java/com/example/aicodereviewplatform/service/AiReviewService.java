package com.example.aicodereviewplatform.service;

import com.example.aicodereviewplatform.dto.CodeReviewResult;
import com.example.aicodereviewplatform.exception.AiReviewException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiReviewService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    private static final String PROMPT_TEMPLATE = """
            You are a senior Java code reviewer.
            Review the supplied code.

            Focus on:
            - Bugs
            - Security Issues
            - Performance Issues
            - Maintainability Issues
            - Refactoring Suggestions

            Return ONLY valid JSON.
            Required JSON format:
            {
              "bugs": "...",
              "securityIssues": "...",
              "performanceIssues": "...",
              "maintainabilityIssues": "...",
              "refactoringSuggestions": "...",
              "overallSummary": "..."
            }

            If no issues are found for a specific category, explicitly state 'None found' in the corresponding field.

            Do not return markdown.
            Do not return explanations.
            Do not wrap in code blocks.

            Code to review:
            {code}
            """;

    public CodeReviewResult getReview(String sourceCode) {
        String prompt = PROMPT_TEMPLATE.replace("{code}", sourceCode);

        try {
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // The response from the LLM might be wrapped in markdown ```json ... ```, let's strip it.
            String cleanJson = response.trim().replace("```json", "").replace("```", "").trim();

            return objectMapper.readValue(cleanJson, CodeReviewResult.class);
        } catch (JsonProcessingException e) {
            throw new AiReviewException("Failed to parse AI response into JSON. Response was: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new AiReviewException("Failed to get review from AI service: " + e.getMessage(), e);
        }
    }
}
