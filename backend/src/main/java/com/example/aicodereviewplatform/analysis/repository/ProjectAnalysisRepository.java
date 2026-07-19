package com.example.aicodereviewplatform.analysis.repository;

import com.example.aicodereviewplatform.analysis.model.ProjectAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectAnalysisRepository extends JpaRepository<ProjectAnalysis, UUID> {

    @Query("SELECT pa FROM ProjectAnalysis pa " +
           "LEFT JOIN FETCH pa.fileAnalyses fa " +
           "LEFT JOIN FETCH fa.typeDefinitions td " +
           "LEFT JOIN FETCH td.methodDefinitions " +
           "LEFT JOIN FETCH fa.checkstyleViolations " +
           "WHERE pa.id = :id")
    Optional<ProjectAnalysis> findByIdWithDetails(@Param("id") UUID id);
}
