package com.mehfil.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findFirstByPhoneAndConsumedFalseOrderByCreatedAtDesc(String phone);
    long countByPhoneAndCreatedAtAfter(String phone, Instant after);
}
