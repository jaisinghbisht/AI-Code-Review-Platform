package com.example.aicodereviewplatform.analysis.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiReviewRepository extends JpaRepository<AiReview, UUID> {

    @Query("SELECT r FROM AiReview r " +
           "LEFT JOIN FETCH r.sections s " +
           "WHERE r.id = :id")
    Optional<AiReview> findByIdWithDetails(@Param("id") UUID id);
}
