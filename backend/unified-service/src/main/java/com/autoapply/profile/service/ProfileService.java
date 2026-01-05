package com.autoapply.profile.service;

import com.autoapply.profile.dto.*;
import com.autoapply.profile.entity.*;
import com.autoapply.profile.repository.ProfileRepository;
import com.autoapply.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        applyBasicProfileFields(profile, userId, profileDTO);

        replaceExperiences(profile, profileDTO);
        replaceEducation(profile, profileDTO);
        replaceSkills(profile, profileDTO);

        Profile savedProfile = java.util.Objects.requireNonNull(profileRepository.save(profile));
        return mapToDTO(savedProfile);
    }

    public ProfileDTO getProfileByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found for userId: " + userId));
        return mapToDTO(profile);
    }

    private void applyBasicProfileFields(Profile profile, Long userId, ProfileDTO profileDTO) {
        profile.setUserId(userId);
        profile.setFullName(profileDTO.getFullName());
        profile.setPhone(profileDTO.getPhone());
        profile.setLocation(profileDTO.getLocation());
        profile.setLinkedinUrl(profileDTO.getLinkedinUrl());
        profile.setPortfolioUrl(profileDTO.getPortfolioUrl());
        profile.setSummary(profileDTO.getSummary());
    }

    private void replaceExperiences(Profile profile, ProfileDTO profileDTO) {
        if (profileDTO.getExperiences() == null) {
            return;
        }

        profile.getExperiences().clear();
        profileDTO.getExperiences().forEach(expDTO -> profile.getExperiences().add(toExperience(profile, expDTO)));
    }

    private Experience toExperience(Profile profile, ExperienceDTO expDTO) {
        Experience exp = new Experience();
        exp.setCompany(expDTO.getCompany());
        exp.setPosition(expDTO.getPosition());
        exp.setDescription(expDTO.getDescription());
        exp.setStartDate(expDTO.getStartDate());
        exp.setEndDate(expDTO.getEndDate());
        exp.setIsCurrent(expDTO.getIsCurrent());
        exp.setLocation(expDTO.getLocation());
        exp.setProfile(profile);
        return exp;
    }

    private void replaceEducation(Profile profile, ProfileDTO profileDTO) {
        if (profileDTO.getEducation() == null) {
            return;
        }

        profile.getEducation().clear();
        profileDTO.getEducation().forEach(eduDTO -> profile.getEducation().add(toEducation(profile, eduDTO)));
    }

    private Education toEducation(Profile profile, EducationDTO eduDTO) {
        Education edu = new Education();
        edu.setInstitution(eduDTO.getInstitution());
        edu.setDegree(eduDTO.getDegree());
        edu.setFieldOfStudy(eduDTO.getFieldOfStudy());
        edu.setStartDate(eduDTO.getStartDate());
        edu.setEndDate(eduDTO.getEndDate());
        edu.setGpa(eduDTO.getGpa());
        edu.setProfile(profile);
        return edu;
    }

    private void replaceSkills(Profile profile, ProfileDTO profileDTO) {
        if (profileDTO.getSkills() == null) {
            return;
        }

        profile.getSkills().clear();
        profileDTO.getSkills().forEach(skillDTO -> profile.getSkills().add(toSkill(profile, skillDTO)));
    }

    private Skill toSkill(Profile profile, SkillDTO skillDTO) {
        Skill skill = new Skill();
        skill.setName(skillDTO.getName());
        skill.setCategory(skillDTO.getCategory());
        skill.setProficiencyLevel(skillDTO.getProficiencyLevel());
        skill.setProfile(profile);
        return skill;
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
                .toList());

        dto.setEducation(profile.getEducation().stream()
                .map(this::mapEducationToDTO)
                .toList());

        dto.setSkills(profile.getSkills().stream()
                .map(this::mapSkillToDTO)
                .toList());

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

