package com.autoapply.applicationtracker.controller;

import com.autoapply.applicationtracker.dto.JobApplicationDTO;
import com.autoapply.applicationtracker.entity.JobApplication;
import com.autoapply.applicationtracker.service.ApplicationTrackerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationTrackerController {
    private final ApplicationTrackerService applicationTrackerService;

    public ApplicationTrackerController(ApplicationTrackerService applicationTrackerService) {
        this.applicationTrackerService = applicationTrackerService;
    }

    @PostMapping
    public ResponseEntity<JobApplicationDTO> createApplication(@Valid @RequestBody JobApplicationDTO dto) {
        JobApplicationDTO created = applicationTrackerService.createApplication(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByUserId(@PathVariable Long userId) {
        List<JobApplicationDTO> applications = applicationTrackerService.getApplicationsByUserId(userId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<JobApplicationDTO>> getApplicationsByStatus(
            @PathVariable Long userId,
            @PathVariable JobApplication.ApplicationStatus status) {
        List<JobApplicationDTO> applications = applicationTrackerService.getApplicationsByStatus(userId, status);
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplicationDTO dto) {
        JobApplicationDTO updated = applicationTrackerService.updateApplication(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationTrackerService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}

