package com.autoapply.resumetailor.controller;

import com.autoapply.resumetailor.dto.CreateResumeVersionRequest;
import com.autoapply.resumetailor.dto.ResumeVersionDTO;
import com.autoapply.resumetailor.service.ResumeVersionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Objects;

@RestController
@RequestMapping("/api/resume-versions")
public class ResumeVersionController {
    private final ResumeVersionService resumeVersionService;

    public ResumeVersionController(ResumeVersionService resumeVersionService) {
        this.resumeVersionService = resumeVersionService;
    }

    @PostMapping
    public ResponseEntity<ResumeVersionDTO> create(@Valid @RequestBody CreateResumeVersionRequest request) {
        ResumeVersionDTO created = resumeVersionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeVersionDTO> getById(@PathVariable long id) {
        return ResponseEntity.ok(resumeVersionService.getById(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable long id) {
        ResumeVersionDTO resume = resumeVersionService.getById(id);
        String filename = "resume-" + id + ".txt";
        byte[] bytes = (resume.getResumeContent() == null ? "" : resume.getResumeContent()).getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(Objects.requireNonNull(MediaType.TEXT_PLAIN))
                .body(bytes);
    }
}


