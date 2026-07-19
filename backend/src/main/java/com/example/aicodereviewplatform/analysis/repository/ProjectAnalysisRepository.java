package com.example.aicodereviewplatform.analysis.repository;

import com.example.aicodereviewplatform.analysis.model.ProjectAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProjectAnalysisRepository extends JpaRepository<ProjectAnalysis, UUID> {
}
