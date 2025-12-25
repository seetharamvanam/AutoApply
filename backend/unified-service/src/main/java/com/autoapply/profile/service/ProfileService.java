package com.autoapply.profile.service;

import com.autoapply.profile.dto.*;
import com.autoapply.profile.entity.*;
import com.autoapply.profile.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class ProfileService {
    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional
    public ProfileDTO createOrUpdateProfile(Long userId, ProfileDTO profileDTO) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElse(new Profile());

        profile.setUserId(userId);
        profile.setFullName(profileDTO.getFullName());
        profile.setPhone(profileDTO.getPhone());
        profile.setLocation(profileDTO.getLocation());
        profile.setLinkedinUrl(profileDTO.getLinkedinUrl());
        profile.setPortfolioUrl(profileDTO.getPortfolioUrl());
        profile.setSummary(profileDTO.getSummary());

        // Update experiences
        if (profileDTO.getExperiences() != null) {
            profile.getExperiences().clear();
            profileDTO.getExperiences().forEach(expDTO -> {
                Experience exp = new Experience();
                exp.setCompany(expDTO.getCompany());
                exp.setPosition(expDTO.getPosition());
                exp.setDescription(expDTO.getDescription());
                exp.setStartDate(expDTO.getStartDate());
                exp.setEndDate(expDTO.getEndDate());
                exp.setIsCurrent(expDTO.getIsCurrent());
                exp.setLocation(expDTO.getLocation());
                exp.setProfile(profile);
                profile.getExperiences().add(exp);
            });
        }

        // Update education
        if (profileDTO.getEducation() != null) {
            profile.getEducation().clear();
            profileDTO.getEducation().forEach(eduDTO -> {
                Education edu = new Education();
                edu.setInstitution(eduDTO.getInstitution());
                edu.setDegree(eduDTO.getDegree());
                edu.setFieldOfStudy(eduDTO.getFieldOfStudy());
                edu.setStartDate(eduDTO.getStartDate());
                edu.setEndDate(eduDTO.getEndDate());
                edu.setGpa(eduDTO.getGpa());
                edu.setProfile(profile);
                profile.getEducation().add(edu);
            });
        }

        // Update skills
        if (profileDTO.getSkills() != null) {
            profile.getSkills().clear();
            profileDTO.getSkills().forEach(skillDTO -> {
                Skill skill = new Skill();
                skill.setName(skillDTO.getName());
                skill.setCategory(skillDTO.getCategory());
                skill.setProficiencyLevel(skillDTO.getProficiencyLevel());
                skill.setProfile(profile);
                profile.getSkills().add(skill);
            });
        }

        Profile savedProfile = profileRepository.save(profile);
        return mapToDTO(savedProfile);
    }

    public ProfileDTO getProfileByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return mapToDTO(profile);
    }

    private ProfileDTO mapToDTO(Profile profile) {
        ProfileDTO dto = new ProfileDTO();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUserId());
        dto.setFullName(profile.getFullName());
        dto.setPhone(profile.getPhone());
        dto.setLocation(profile.getLocation());
        dto.setLinkedinUrl(profile.getLinkedinUrl());
        dto.setPortfolioUrl(profile.getPortfolioUrl());
        dto.setSummary(profile.getSummary());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());

        dto.setExperiences(profile.getExperiences().stream()
                .map(this::mapExperienceToDTO)
                .collect(Collectors.toList()));

        dto.setEducation(profile.getEducation().stream()
                .map(this::mapEducationToDTO)
                .collect(Collectors.toList()));

        dto.setSkills(profile.getSkills().stream()
                .map(this::mapSkillToDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    private ExperienceDTO mapExperienceToDTO(Experience exp) {
        ExperienceDTO dto = new ExperienceDTO();
        dto.setId(exp.getId());
        dto.setCompany(exp.getCompany());
        dto.setPosition(exp.getPosition());
        dto.setDescription(exp.getDescription());
        dto.setStartDate(exp.getStartDate());
        dto.setEndDate(exp.getEndDate());
        dto.setIsCurrent(exp.getIsCurrent());
        dto.setLocation(exp.getLocation());
        return dto;
    }

    private EducationDTO mapEducationToDTO(Education edu) {
        EducationDTO dto = new EducationDTO();
        dto.setId(edu.getId());
        dto.setInstitution(edu.getInstitution());
        dto.setDegree(edu.getDegree());
        dto.setFieldOfStudy(edu.getFieldOfStudy());
        dto.setStartDate(edu.getStartDate());
        dto.setEndDate(edu.getEndDate());
        dto.setGpa(edu.getGpa());
        return dto;
    }

    private SkillDTO mapSkillToDTO(Skill skill) {
        SkillDTO dto = new SkillDTO();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        dto.setCategory(skill.getCategory());
        dto.setProficiencyLevel(skill.getProficiencyLevel());
        return dto;
    }
}

