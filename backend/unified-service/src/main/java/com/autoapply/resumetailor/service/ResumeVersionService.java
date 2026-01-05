package com.autoapply.resumetailor.service;

import com.autoapply.resumetailor.dto.CreateResumeVersionRequest;
import com.autoapply.resumetailor.dto.ResumeVersionDTO;
import com.autoapply.resumetailor.entity.ResumeVersion;
import com.autoapply.resumetailor.repository.ResumeVersionRepository;
import com.autoapply.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResumeVersionService {
    private final ResumeVersionRepository resumeVersionRepository;

    public ResumeVersionService(ResumeVersionRepository resumeVersionRepository) {
        this.resumeVersionRepository = resumeVersionRepository;
    }

    @Transactional
    public ResumeVersionDTO create(CreateResumeVersionRequest request) {
        ResumeVersion rv = new ResumeVersion();
        rv.setUserId(request.getUserId());
        rv.setJobApplicationId(request.getJobApplicationId());
        rv.setResumeContent(request.getResumeContent());
        rv.setAtsScore(request.getAtsScore());
        rv.setAtsFeedback(request.getAtsFeedback());

        rv = resumeVersionRepository.save(rv);
        return toDto(rv);
    }

    public ResumeVersionDTO getById(long id) {
        ResumeVersion rv = resumeVersionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resume version not found: " + id));
        return toDto(rv);
    }

    private ResumeVersionDTO toDto(ResumeVersion rv) {
        ResumeVersionDTO dto = new ResumeVersionDTO();
        dto.setId(rv.getId());
        dto.setUserId(rv.getUserId());
        dto.setJobApplicationId(rv.getJobApplicationId());
        dto.setResumeContent(rv.getResumeContent());
        dto.setAtsScore(rv.getAtsScore());
        dto.setAtsFeedback(rv.getAtsFeedback());
        dto.setCreatedAt(rv.getCreatedAt());
        return dto;
    }
}


