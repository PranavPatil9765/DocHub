package com.example.DocHub.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.DocHub.config.PasswordResetTokenUtil;
import com.example.DocHub.entity.PasswordResetOtp;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException.*;
import com.example.DocHub.repository.PasswordResetOtpRepository;
import com.example.DocHub.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder encoder;
    private final EmailService emailService;
    private final PasswordResetTokenUtil passwordResetTokenUtil;

    /* ================= SEND OTP ================= */

    @Transactional
    public void sendOtp(String email) {

        if (!userRepository.existsByEmail(email)) {
            throw new ResourceNotFoundException("Email not registered");
        }

        // 🔥 Remove previous reset attempts
        otpRepository.deleteByEmail(email);

        // 🔢 Secure OTP
        String otp = String.valueOf(
                100000 + new java.security.SecureRandom().nextInt(900000)
        );

        // 🔐 JWT reset token
        String resetToken =
                passwordResetTokenUtil.generateResetToken(email);

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(email);
        resetOtp.setOtp(otp);
        resetOtp.setResetToken(resetToken);
        resetOtp.setExpiryTime(LocalDateTime.now().plusMinutes(5)); // OTP expiry
        resetOtp.setVerified(false);

        otpRepository.save(resetOtp);

        try {
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            throw new InternalServerError("Email service failed");
        }
    }

    /* ================= VERIFY OTP ================= */

    @Transactional
    public String verifyOtp(String email, String otp) {

        PasswordResetOtp resetOtp = otpRepository
                .findByEmailAndOtp(email, otp)
                .orElseThrow(() ->
                        new BadRequestException("Invalid OTP"));

        if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(resetOtp);
            throw new BadRequestException("OTP expired");
        }

        // ✅ Mark verified (JWT already issued)
        resetOtp.setVerified(true);
        otpRepository.save(resetOtp);

        return resetOtp.getResetToken();
    }

    /* ================= RESET PASSWORD ================= */

    @Transactional
    public void resetPassword(String token, String newPassword) {

        PasswordResetOtp resetOtp = otpRepository
                .findByResetToken(token)
                .orElseThrow(() ->
                        new BadRequestException("Invalid token"));

        if (!resetOtp.isVerified()) {
            throw new BadRequestException("OTP not verified");
        }

        // JWT expiry is validated separately in util,
        // this is an extra DB safety check
        if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(resetOtp);
            throw new BadRequestException("Reset session expired");
        }

        User user = userRepository.findByEmail(resetOtp.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        // 🔥 One-time use guarantee
        otpRepository.deleteByEmail(resetOtp.getEmail());
    }
}
