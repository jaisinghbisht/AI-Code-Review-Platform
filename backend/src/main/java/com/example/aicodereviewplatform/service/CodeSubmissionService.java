package com.example.aicodereviewplatform.service;

import com.example.aicodereviewplatform.dto.CodeSubmissionRequest;
import com.example.aicodereviewplatform.dto.CodeSubmissionResponse;
import com.example.aicodereviewplatform.entity.CodeSubmission;
import com.example.aicodereviewplatform.repository.CodeSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CodeSubmissionService {

    private final CodeSubmissionRepository codeSubmissionRepository;

    @Transactional
    public CodeSubmissionResponse submitCode(CodeSubmissionRequest request) {
        CodeSubmission submission = CodeSubmission.builder()
                .filename(request.getFilename())
                .language(request.getLanguage())
                .sourceCode(request.getSourceCode())
                .createdAt(LocalDateTime.now())
                .build();

        submission = codeSubmissionRepository.save(submission);

        return new CodeSubmissionResponse(submission.getId());
    }
}
