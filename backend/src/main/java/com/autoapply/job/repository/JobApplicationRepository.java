package com.autoapply.job.repository;

import com.autoapply.job.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT j.status, COUNT(j) FROM JobApplication j WHERE j.userId = :userId GROUP BY j.status")
    List<Object[]> countJobsByStatus(Long userId);
}
