package com.example.DocHub.controller;

import com.example.DocHub.config.PasswordResetTokenUtil;
import com.example.DocHub.dto.AuthResponse;
import com.example.DocHub.dto.ForgotPasswordRequest;
import com.example.DocHub.dto.LoginRequest;
import com.example.DocHub.dto.RegisterRequest;
import com.example.DocHub.dto.VerifyOtpRequest;
import com.example.DocHub.dto.request.ResetPasswordRequest;
import com.example.DocHub.service.AuthService;
import com.example.DocHub.service.PasswordResetService;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.exception.AppException.UnauthorizedException;
import com.example.DocHub.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    @Autowired
    private PasswordResetService passwordResetService;
    private PasswordResetTokenUtil passwordResetTokenService;
    private UserRepository userRepo;
    private PasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "User Registered Successfully", null));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        System.out.println("🔐 LOGIN endpoint reached!");
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<com.example.DocHub.dto.response.ApiResponse<Void>> sendOtp(
            @RequestBody ForgotPasswordRequest request) {

        passwordResetService.sendOtp(request.getEmail());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OTP sent successfully",
                        null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        String token = passwordResetService.verifyOtp(
                request.getEmail(),
                request.getOtp());

        return ResponseEntity.ok(
                Map.of("message", "OTP verified successfully", "token", token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        // 1️⃣ Validate reset token & extract email
        String email = passwordResetTokenService
                .validateAndGetEmail(request.token());

        // 2️⃣ Load user safely
        User user = userRepo.findByEmail(email).orElseThrow(() ->
                    new UnauthorizedException("Unauthorized request"));

        // 3️⃣ Update password
        user.setPassword(encoder.encode(request.password()));
        userRepo.save(user);

        // 4️⃣ Invalidate reset token (CRITICAL)
        passwordResetTokenService.invalidate(request.token());

        return ResponseEntity.ok(
               new ApiResponse<>(true, "Password reset Successfull", null));
    }

}
