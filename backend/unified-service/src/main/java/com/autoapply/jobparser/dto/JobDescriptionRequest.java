package com.autoapply.jobparser.dto;

import jakarta.validation.constraints.NotBlank;

public class JobDescriptionRequest {
    @NotBlank(message = "Job description is required")
    private String jobDescription;

    private String jobUrl;

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }
}

