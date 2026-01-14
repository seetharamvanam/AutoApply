package com.autoapply.job.dto;

import com.autoapply.job.entity.JobApplication;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {
    private Long id;
    private Long userId;
    private String url;
    private String title;
    private String company;
    private String description;
    private JobApplication.Status status;
    private LocalDateTime appliedAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
