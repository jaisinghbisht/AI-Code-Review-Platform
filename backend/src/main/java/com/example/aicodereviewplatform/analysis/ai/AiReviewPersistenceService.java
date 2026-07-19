package com.example.aicodereviewplatform.analysis.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiReviewPersistenceService {

    private final AiReviewRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AiReview saveReviewInNewTransaction(AiReview review) {
        return repository.save(review);
    }
}
