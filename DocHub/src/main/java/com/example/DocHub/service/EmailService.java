package com.example.DocHub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");
        message.setFrom("dochub162@gmail.com");
        mailSender.send(message);
    }
    public void sendVerificationEmail(String email, String token) {

        String link = "https://t4h2k4d0-8080.inc1.devtunnels.ms/auth/verify?token=" + token;
        // String link = "http://localhost:8080/auth/verify?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Verify your DocHub account");
        message.setText("""
                Welcome to DocHub!

                Click the link below to verify your account:
                %s

                This link expires in 24 hours.
                """.formatted(link));

        mailSender.send(message);
    }
}
