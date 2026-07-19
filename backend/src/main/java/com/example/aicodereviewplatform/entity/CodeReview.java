package com.example.aicodereviewplatform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "code_review")
public class CodeReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id")
    private CodeSubmission submission;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String bugs;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String securityIssues;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String performanceIssues;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String maintainabilityIssues;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String refactoringSuggestions;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String overallSummary;

    private LocalDateTime createdAt;
}
