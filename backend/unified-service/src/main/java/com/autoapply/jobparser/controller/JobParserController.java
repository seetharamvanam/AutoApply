package com.autoapply.jobparser.controller;

import com.autoapply.jobparser.dto.JobDescriptionRequest;
import com.autoapply.jobparser.dto.JobParsingResult;
import com.autoapply.jobparser.service.JobParserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobParserController {
    private final JobParserService jobParserService;

    public JobParserController(JobParserService jobParserService) {
        this.jobParserService = jobParserService;
    }

    @PostMapping("/parse")
    public ResponseEntity<JobParsingResult> parseJobDescription(
            @Valid @RequestBody JobDescriptionRequest request) {
        JobParsingResult result = jobParserService.parseJob(request);
        return ResponseEntity.ok(result);
    }
}

