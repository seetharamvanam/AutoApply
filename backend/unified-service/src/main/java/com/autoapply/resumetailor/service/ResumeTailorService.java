package com.autoapply.resumetailor.service;

import com.autoapply.resumetailor.dto.TailorResumeRequest;
import com.autoapply.resumetailor.dto.TailoredResumeResponse;
import com.autoapply.resumetailor.service.ai.ResumeTailoringService;
import org.springframework.stereotype.Service;

@Service
public class ResumeTailorService {
    private final ResumeTailoringService resumeTailoringService;

    public ResumeTailorService(ResumeTailoringService resumeTailoringService) {
        this.resumeTailoringService = resumeTailoringService;
    }

    public TailoredResumeResponse tailorResume(TailorResumeRequest request) {
        // TODO: Fetch user profile from profile-service
        String userProfileJson = "{}"; // Placeholder
        
        return resumeTailoringService.tailorResume(userProfileJson, request.getJobDescription());
    }
}

