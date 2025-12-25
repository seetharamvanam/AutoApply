package com.autoapply.profile.controller;

import com.autoapply.profile.dto.ProfileDTO;
import com.autoapply.profile.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileDTO> getProfile(@PathVariable Long userId) {
        ProfileDTO profile = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<ProfileDTO> createOrUpdateProfile(
            @PathVariable Long userId,
            @RequestBody ProfileDTO profileDTO) {
        ProfileDTO savedProfile = profileService.createOrUpdateProfile(userId, profileDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProfile);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ProfileDTO> updateProfile(
            @PathVariable Long userId,
            @RequestBody ProfileDTO profileDTO) {
        ProfileDTO updatedProfile = profileService.createOrUpdateProfile(userId, profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }
}

