package com.example.aicodereviewplatform.project.controller;

import com.example.aicodereviewplatform.project.dto.ProjectInfoDTO;
import com.example.aicodereviewplatform.project.service.ProjectProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectProcessingService projectService;

    @PostMapping("/upload")
    public ResponseEntity<com.example.aicodereviewplatform.project.dto.UploadResponse> uploadProject(@RequestParam("file") MultipartFile file) {
        UUID jobId = UUID.randomUUID();
        return ResponseEntity.ok(projectService.initiateUpload(file, jobId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectInfoDTO> getProject(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProjectInfo(id));
    }

    @GetMapping
    public ResponseEntity<java.util.List<ProjectInfoDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}/file-content")
    public ResponseEntity<String> getFileContent(@PathVariable UUID id, @RequestParam("path") String path) {
        return ResponseEntity.ok(projectService.getFileContent(id, path));
    }
}
