package com.autoapply.job.controller;

import com.autoapply.job.dto.CreateJobRequest;
import com.autoapply.job.dto.DashboardStatsDTO;
import com.autoapply.job.dto.JobApplicationDTO;
import com.autoapply.job.dto.UpdateJobRequest;
import com.autoapply.job.service.JobService;
import com.autoapply.job.service.LinkParserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {
    private final JobService jobService;
    private final LinkParserService linkParserService;

    @PostMapping
    public ResponseEntity<JobApplicationDTO> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        JobApplicationDTO job = jobService.createJob(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(job);
    }

    @PostMapping("/parse")
    public ResponseEntity<JobApplicationDTO> parseLink(@RequestBody String url) {
        JobApplicationDTO job = linkParserService.parseJobLink(url);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        DashboardStatsDTO stats = jobService.getDashboardStats(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping
    public ResponseEntity<List<JobApplicationDTO>> getUserJobs(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<JobApplicationDTO> jobs = jobService.getUserJobs(userId);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> getJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        JobApplicationDTO job = jobService.getJobById(id, userId);
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> updateJob(
            @PathVariable Long id,
            @RequestBody UpdateJobRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        JobApplicationDTO job = jobService.updateJob(id, userId, request);
        return ResponseEntity.ok(job);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        jobService.deleteJob(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(UserDetails userDetails) {
        if (userDetails instanceof com.autoapply.auth.entity.User) {
            return ((com.autoapply.auth.entity.User) userDetails).getId();
        }
        throw new IllegalStateException("User details is not of expected type");
    }
}
