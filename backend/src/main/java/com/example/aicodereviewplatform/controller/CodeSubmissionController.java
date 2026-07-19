package com.example.aicodereviewplatform.controller;

import com.example.aicodereviewplatform.dto.CodeSubmissionRequest;
import com.example.aicodereviewplatform.dto.CodeSubmissionResponse;
import com.example.aicodereviewplatform.service.CodeSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class CodeSubmissionController {

    private final CodeSubmissionService codeSubmissionService;

    @PostMapping
    public ResponseEntity<CodeSubmissionResponse> submitCode(@RequestBody CodeSubmissionRequest request) {
        return ResponseEntity.ok(codeSubmissionService.submitCode(request));
    }
}
