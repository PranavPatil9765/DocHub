package com.example.DocHub.repository;

import com.example.DocHub.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetOtpRepository
        extends JpaRepository<PasswordResetOtp, Long> {
}
