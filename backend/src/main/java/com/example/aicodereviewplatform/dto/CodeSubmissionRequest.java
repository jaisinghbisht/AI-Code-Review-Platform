package com.example.aicodereviewplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeSubmissionRequest {
    private String filename;
    private String language;
    private String sourceCode;
}
