package com.autoapply.resumetailor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateResumeVersionRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    private Long jobApplicationId;

    @NotBlank(message = "Resume content is required")
    private String resumeContent;

    private Integer atsScore;
    private String atsFeedback;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getJobApplicationId() {
        return jobApplicationId;
    }

    public void setJobApplicationId(Long jobApplicationId) {
        this.jobApplicationId = jobApplicationId;
    }

    public String getResumeContent() {
        return resumeContent;
    }

    public void setResumeContent(String resumeContent) {
        this.resumeContent = resumeContent;
    }

    public Integer getAtsScore() {
        return atsScore;
    }

    public void setAtsScore(Integer atsScore) {
        this.atsScore = atsScore;
    }

    public String getAtsFeedback() {
        return atsFeedback;
    }

    public void setAtsFeedback(String atsFeedback) {
        this.atsFeedback = atsFeedback;
    }
}



