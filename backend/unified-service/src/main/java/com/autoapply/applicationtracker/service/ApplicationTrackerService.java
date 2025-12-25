package com.autoapply.applicationtracker.service;

import com.autoapply.applicationtracker.dto.JobApplicationDTO;
import com.autoapply.applicationtracker.entity.JobApplication;
import com.autoapply.applicationtracker.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationTrackerService {
    private final JobApplicationRepository jobApplicationRepository;

    public ApplicationTrackerService(JobApplicationRepository jobApplicationRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
    }

    @Transactional
    public JobApplicationDTO createApplication(JobApplicationDTO dto) {
        JobApplication application = new JobApplication();
        application.setUserId(dto.getUserId());
        application.setJobTitle(dto.getJobTitle());
        application.setCompanyName(dto.getCompanyName());
        application.setJobUrl(dto.getJobUrl());
        application.setStatus(dto.getStatus() != null ? dto.getStatus() : JobApplication.ApplicationStatus.APPLIED);
        application.setResumeVersionId(dto.getResumeVersionId());
        application.setNotes(dto.getNotes());

        application = jobApplicationRepository.save(application);
        return mapToDTO(application);
    }

    public List<JobApplicationDTO> getApplicationsByUserId(Long userId) {
        List<JobApplication> applications = jobApplicationRepository.findByUserIdOrderByAppliedDateDesc(userId);
        return applications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<JobApplicationDTO> getApplicationsByStatus(Long userId, JobApplication.ApplicationStatus status) {
        List<JobApplication> applications = jobApplicationRepository.findByUserIdAndStatus(userId, status);
        return applications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationDTO updateApplication(Long id, JobApplicationDTO dto) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (dto.getStatus() != null) {
            application.setStatus(dto.getStatus());
        }
        if (dto.getNotes() != null) {
            application.setNotes(dto.getNotes());
        }
        if (dto.getJobUrl() != null) {
            application.setJobUrl(dto.getJobUrl());
        }

        application = jobApplicationRepository.save(application);
        return mapToDTO(application);
    }

    @Transactional
    public void deleteApplication(Long id) {
        jobApplicationRepository.deleteById(id);
    }

    private JobApplicationDTO mapToDTO(JobApplication application) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(application.getId());
        dto.setUserId(application.getUserId());
        dto.setJobTitle(application.getJobTitle());
        dto.setCompanyName(application.getCompanyName());
        dto.setJobUrl(application.getJobUrl());
        dto.setStatus(application.getStatus());
        dto.setAppliedDate(application.getAppliedDate());
        dto.setResumeVersionId(application.getResumeVersionId());
        dto.setNotes(application.getNotes());
        dto.setCreatedAt(application.getCreatedAt());
        dto.setUpdatedAt(application.getUpdatedAt());
        return dto;
    }
}

