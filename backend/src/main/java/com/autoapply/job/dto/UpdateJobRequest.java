package com.autoapply.job.dto;

import com.autoapply.job.entity.JobApplication;
import lombok.Data;

@Data
public class UpdateJobRequest {
    private String title;
    private String company;
    private String url;
    private String description;
    private JobApplication.Status status;
    private String notes;
}
