package com.example.aicodereviewplatform.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadResponse {
    private UUID projectId;
    private UUID jobId;
}
