package com.autoapply.resumetailor.controller;

import com.autoapply.resumetailor.dto.TailorResumeRequest;
import com.autoapply.resumetailor.dto.TailoredResumeResponse;
import com.autoapply.resumetailor.service.ResumeTailorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeTailorController {
    private final ResumeTailorService resumeTailorService;

    public ResumeTailorController(ResumeTailorService resumeTailorService) {
        this.resumeTailorService = resumeTailorService;
    }

    @PostMapping("/tailor")
    public ResponseEntity<TailoredResumeResponse> tailorResume(
            @Valid @RequestBody TailorResumeRequest request) {
        TailoredResumeResponse response = resumeTailorService.tailorResume(request);
        return ResponseEntity.ok(response);
    }
}

