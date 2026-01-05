package com.autoapply.formautomation.controller;

import com.autoapply.formautomation.dto.AutomationPlanDTO;
import com.autoapply.formautomation.dto.PageAnalysisRequest;
import com.autoapply.formautomation.service.FormAutomationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/automation")
public class FormAutomationController {
    
    private final FormAutomationService formAutomationService;
    
    public FormAutomationController(FormAutomationService formAutomationService) {
        this.formAutomationService = formAutomationService;
    }
    
    /**
     * Analyzes a page and generates an automation plan.
     * 
     * @param request Page analysis request
     * @param userId User ID (from JWT token or query parameter)
     * @return Automation plan with actions to perform
     */
    @PostMapping("/analyze")
    public ResponseEntity<AutomationPlanDTO> analyzeAndPlan(
            @Valid @RequestBody PageAnalysisRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(value = "userId", required = false) Long userIdParam) {
        
        // Get user ID from header or parameter (in production, extract from JWT)
        Long actualUserId = userId != null ? userId : userIdParam;
        
        if (actualUserId == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        AutomationPlanDTO plan = formAutomationService.analyzePageAndGeneratePlan(request, actualUserId);
        return ResponseEntity.ok(plan);
    }
}

