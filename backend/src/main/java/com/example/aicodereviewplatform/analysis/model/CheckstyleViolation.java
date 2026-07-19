package com.example.aicodereviewplatform.analysis.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "checkstyle_violation")
public class CheckstyleViolation {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_analysis_id")
    private FileAnalysis fileAnalysis;

    private String sourceName;
    private String severity;
    private int line;
    private Integer columnNum;
    @Column(columnDefinition = "TEXT")
    private String message;
}
