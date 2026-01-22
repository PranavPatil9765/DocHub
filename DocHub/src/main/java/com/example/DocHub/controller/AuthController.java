package com.example.DocHub.controller;

import com.example.DocHub.config.PasswordResetTokenUtil;
import com.example.DocHub.dto.*;
import com.example.DocHub.dto.request.ResetPasswordRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.User;
import com.example.DocHub.exception.AppException.UnauthorizedException;
import com.example.DocHub.repository.UserRepository;
import com.example.DocHub.service.AuthService;
import com.example.DocHub.service.PasswordResetService;

import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    // ✅ Constructor-injected dependencies
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final PasswordResetTokenUtil passwordResetTokenService;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    /* ================= REGISTER ================= */

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "User Registered Successfully", null)
        );
    }

    /* ================= LOGIN ================= */

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    /* ================= SEND OTP ================= */

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<?>> sendOtp(
            @RequestBody ForgotPasswordRequest request) {

        passwordResetService.sendOtp(request.getEmail());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "OTP sent successfully", null)
        );
    }

    /* ================= VERIFY OTP ================= */

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        String token = passwordResetService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message", "OTP verified successfully",
                        "token", token
                )
        );
    }

    /* ================= RESET PASSWORD ================= */

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        // 1️⃣ Validate JWT reset token
        String email = passwordResetTokenService
                .validateAndGetEmail(request.token());

        // 2️⃣ Load user
        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new UnauthorizedException("Unauthorized request"));

        // 3️⃣ Update password
        user.setPassword(encoder.encode(request.password()));
        userRepo.save(user);

        // 4️⃣ Invalidate JWT reset token
        passwordResetTokenService.invalidate(request.token());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Password reset successful", null)
        );
    }
}
