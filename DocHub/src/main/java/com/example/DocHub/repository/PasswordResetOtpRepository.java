package com.example.DocHub.repository;
import java.util.Optional;
import com.example.DocHub.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetOtpRepository
        extends JpaRepository<PasswordResetOtp, Long> {

               Optional<PasswordResetOtp> findByEmailAndOtp(String email, String otp);

    // 🔎 Find record by reset token
    Optional<PasswordResetOtp> findByResetToken(String resetToken);

    // 🧹 Delete old OTPs before creating new ones
    void deleteByEmail(String email);
}

