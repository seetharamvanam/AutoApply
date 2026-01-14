package com.autoapply.job.dto;

import com.autoapply.job.entity.JobApplication;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateJobRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Company is required")
    private String company;

    private String url;
    private String description;
    private JobApplication.Status status;
    private String notes;
}
