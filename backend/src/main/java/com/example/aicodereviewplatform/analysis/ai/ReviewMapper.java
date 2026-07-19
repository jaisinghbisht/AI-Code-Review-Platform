package com.example.aicodereviewplatform.analysis.ai;

import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.stream.Collectors;

@Component
public class ReviewMapper {

    public ReviewDTO toDto(AiReview entity) {
        if (entity == null) {
            return null;
        }

        var sections = entity.getSections() == null ? null : entity.getSections().stream()
                .map(this::toDto)
                .sorted(Comparator.comparingInt(ReviewSectionDTO::orderIndex))
                .collect(Collectors.toList());

        return new ReviewDTO(
                entity.getId(),
                entity.getAnalysis() != null ? entity.getAnalysis().getId() : null,
                entity.getModel(),
                entity.getCreatedAt(),
                entity.getStatus().name(),
                entity.getPromptTokens(),
                entity.getCompletionTokens(),
                entity.getTotalTokens(),
                entity.getExecutionTimeMs(),
                sections
        );
    }

    public ReviewSectionDTO toDto(ReviewSection entity) {
        if (entity == null) {
            return null;
        }
        return new ReviewSectionDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getContent(),
                entity.getOrderIndex()
        );
    }
}
