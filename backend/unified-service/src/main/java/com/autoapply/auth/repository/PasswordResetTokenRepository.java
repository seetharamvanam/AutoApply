package com.autoapply.auth.repository;

import com.autoapply.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    
    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.user.id = ?1")
    void deleteByUserId(Long userId);
    
    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.expiryDate < ?1 OR prt.used = true")
    void deleteExpiredOrUsedTokens(LocalDateTime now);
}

