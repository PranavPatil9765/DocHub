package com.example.DocHub.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.DocHub.entity.PasswordResetOtp;
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
        return;
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
        e.printStackTrace();
    }
}

}
