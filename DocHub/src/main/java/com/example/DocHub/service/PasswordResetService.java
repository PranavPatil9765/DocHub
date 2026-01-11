package com.example.DocHub.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.DocHub.config.PasswordResetTokenUtil;
import com.example.DocHub.entity.PasswordResetOtp;
import com.example.DocHub.exception.AppException.*;
import com.example.DocHub.repository.PasswordResetOtpRepository;
import com.example.DocHub.repository.UserRepository;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public void sendOtp(String email) {

    System.out.println(">>> STEP 1: sendOtp() called with email = " + email);

    boolean exists = userRepository.existsByEmail(email);
    System.out.println(">>> STEP 2: existsByEmail = " + exists);

    if (!exists) {
        System.out.println(">>> STEP 3: Email not found, returning");
        throw new ResourceNotFoundException("Email not registered");
    }

    System.out.println(">>> STEP 4: Email found, generating OTP");

    String otp = String.valueOf(100000 + new Random().nextInt(900000));

    PasswordResetOtp resetOtp = new PasswordResetOtp();
    resetOtp.setEmail(email);
    resetOtp.setOtp(otp);
    resetOtp.setExpiryTime(LocalDateTime.now().plusMinutes(5));

    otpRepository.save(resetOtp);
    System.out.println(">>> STEP 5: OTP saved in DB");

    try {
        emailService.sendOtpEmail(email, otp);
        System.out.println(">>> STEP 6: Email sent successfully");
    } catch (Exception e) {
        System.out.println(">>> STEP 6 ERROR: Email sending failed");
        throw new InternalServerError("Email service failed");
    }
}

public String verifyOtp(String email, String otp) {

    PasswordResetOtp resetOtp = otpRepository
            .findByEmailAndOtp(email, otp)
            .orElseThrow(() ->
                    new RuntimeException("Invalid OTP"));

    // ⏱ Expiry check
    if (resetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
        otpRepository.delete(resetOtp);
        throw new RuntimeException("OTP expired");
    }

    // ❌ Already used check (optional but good)
    if (resetOtp.isUsed()) {
        throw new RuntimeException("OTP already used");
    }

    // ✅ OTP valid → delete from DB
    otpRepository.delete(resetOtp);

    System.out.println(">>> OTP verified and deleted successfully");

    String resetToken = PasswordResetTokenUtil.generateResetToken(email);

    return resetToken;
}


}
