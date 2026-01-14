package com.autoapply.job.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "job_url")
    private String url;

    @Column(name = "job_title", nullable = false)
    private String title;

    @Column(name = "company_name", nullable = false)
    private String company;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.SAVED;

    @Column(name = "applied_date")
    private LocalDateTime appliedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == Status.APPLIED && appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == Status.APPLIED && appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
    }

    public enum Status {
        SAVED,
        APPLIED,
        SCREENING,
        INTERVIEW,
        INTERVIEW_DONE,
        OFFER,
        REJECTED,
        WITHDRAWN
    }
}
