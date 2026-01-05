package com.autoapply.formautomation.service;

import com.autoapply.formautomation.dto.AutomationPlanDTO;
import com.autoapply.formautomation.dto.PageAnalysisRequest;
import com.autoapply.formautomation.service.ai.PageAnalysisService;
import com.autoapply.common.exception.ServiceException;
import com.autoapply.profile.service.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

/**
 * Service for form automation operations.
 */
@Service
public class FormAutomationService {
    
    private final PageAnalysisService pageAnalysisService;
    private final ProfileService profileService;
    private final ObjectMapper objectMapper;
    
    public FormAutomationService(PageAnalysisService pageAnalysisService, 
                                 ProfileService profileService,
                                 ObjectMapper objectMapper) {
        this.pageAnalysisService = pageAnalysisService;
        this.profileService = profileService;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Analyzes a page and generates an automation plan.
     * 
     * @param request Page analysis request
     * @param userId User ID for profile data
     * @return Automation plan
     */
    public AutomationPlanDTO analyzePageAndGeneratePlan(PageAnalysisRequest request, Long userId) {
        try {
            // Fetch user profile
            var profileDTO = profileService.getProfileByUserId(userId);
            
            // Convert profile to JSON for AI processing
            String profileJson = objectMapper.writeValueAsString(profileDTO);
            
            // Analyze page and generate automation plan
            return pageAnalysisService.analyzeAndPlan(request, profileJson);
        } catch (Exception e) {
            throw new ServiceException("Failed to generate automation plan", e);
        }
    }
}

