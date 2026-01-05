package com.autoapply.formautomation.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * Request DTO for page analysis and automation.
 */
public class PageAnalysisRequest {
    @NotBlank(message = "Page URL is required")
    private String pageUrl;
    
    private String pageTitle;
    private String pageHtml;
    private List<FormFieldDTO> detectedFields;
    private String pageContent; // Extracted text content from page
    private String jobDescription; // Extracted job description if available

    public PageAnalysisRequest() {}

    public String getPageUrl() {
        return pageUrl;
    }

    public void setPageUrl(String pageUrl) {
        this.pageUrl = pageUrl;
    }

    public String getPageTitle() {
        return pageTitle;
    }

    public void setPageTitle(String pageTitle) {
        this.pageTitle = pageTitle;
    }

    public String getPageHtml() {
        return pageHtml;
    }

    public void setPageHtml(String pageHtml) {
        this.pageHtml = pageHtml;
    }

    public List<FormFieldDTO> getDetectedFields() {
        return detectedFields;
    }

    public void setDetectedFields(List<FormFieldDTO> detectedFields) {
        this.detectedFields = detectedFields;
    }

    public String getPageContent() {
        return pageContent;
    }

    public void setPageContent(String pageContent) {
        this.pageContent = pageContent;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
}

