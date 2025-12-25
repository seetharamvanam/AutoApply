package com.autoapply.jobparser.service;

import com.autoapply.jobparser.dto.JobDescriptionRequest;
import com.autoapply.jobparser.dto.JobParsingResult;
import com.autoapply.jobparser.service.ai.JobParsingService;
import org.springframework.stereotype.Service;

@Service
public class JobParserService {
    private final JobParsingService jobParsingService;

    public JobParserService(JobParsingService jobParsingService) {
        this.jobParsingService = jobParsingService;
    }

    public JobParsingResult parseJob(JobDescriptionRequest request) {
        return jobParsingService.parseJobDescription(request.getJobDescription());
    }
}

