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
    public ResponseEntity<ProjectInfoDTO> uploadProject(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(projectService.processUpload(file));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectInfoDTO> getProject(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProjectInfo(id));
    }
}
