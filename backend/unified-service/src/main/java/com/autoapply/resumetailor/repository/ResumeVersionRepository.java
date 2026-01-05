package com.autoapply.resumetailor.repository;

import com.autoapply.resumetailor.entity.ResumeVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, Long> {
    Optional<ResumeVersion> findTopByJobApplicationIdOrderByIdDesc(Long jobApplicationId);
}



