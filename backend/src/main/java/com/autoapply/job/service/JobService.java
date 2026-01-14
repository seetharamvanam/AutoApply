package com.autoapply.job.service;

import com.autoapply.job.dto.CreateJobRequest;
import com.autoapply.job.dto.JobApplicationDTO;
import com.autoapply.job.dto.UpdateJobRequest;
import com.autoapply.job.entity.JobApplication;
import com.autoapply.job.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {
    private final JobApplicationRepository jobRepository;

    @Transactional
    public JobApplicationDTO createJob(Long userId, CreateJobRequest request) {
        JobApplication job = JobApplication.builder()
                .userId(userId)
                .title(request.getTitle())
                .company(request.getCompany())
                .url(request.getUrl())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : JobApplication.Status.SAVED)
                .notes(request.getNotes())
                .build();

        JobApplication saved = jobRepository.save(job);
        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDTO> getUserJobs(Long userId) {
        return jobRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobApplicationDTO getJobById(Long id, Long userId) {
        JobApplication job = jobRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Job application not found"));
        return toDTO(job);
    }

    @Transactional
    public JobApplicationDTO updateJob(Long id, Long userId, UpdateJobRequest request) {
        JobApplication job = jobRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Job application not found"));

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getCompany() != null) job.setCompany(request.getCompany());
        if (request.getUrl() != null) job.setUrl(request.getUrl());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getStatus() != null) job.setStatus(request.getStatus());
        if (request.getNotes() != null) job.setNotes(request.getNotes());

        JobApplication updated = jobRepository.save(job);
        return toDTO(updated);
    }

    @Transactional
    public void deleteJob(Long id, Long userId) {
        if (!jobRepository.existsByIdAndUserId(id, userId)) {
            throw new IllegalArgumentException("Job application not found");
        }
        jobRepository.deleteById(id);
    }

    private JobApplicationDTO toDTO(JobApplication job) {
        return JobApplicationDTO.builder()
                .id(job.getId())
                .userId(job.getUserId())
                .url(job.getUrl())
                .title(job.getTitle())
                .company(job.getCompany())
                .description(job.getDescription())
                .status(job.getStatus())
                .appliedAt(job.getAppliedAt())
                .notes(job.getNotes())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
