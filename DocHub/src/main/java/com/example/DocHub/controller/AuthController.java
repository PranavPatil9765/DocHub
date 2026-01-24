package com.example.DocHub.controller;

import com.example.DocHub.config.PasswordResetTokenUtil;
import com.example.DocHub.dto.*;
import com.example.DocHub.dto.request.ResetPasswordRequest;
import com.example.DocHub.dto.response.ApiResponse;
import com.example.DocHub.entity.User;
import com.example.DocHub.entity.VerificationToken;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.exception.AppException.UnauthorizedException;
import com.example.DocHub.repository.UserRepository;
import com.example.DocHub.repository.VerificationTokenRepository;
import com.example.DocHub.service.AuthService;
import com.example.DocHub.service.PasswordResetService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.time.LocalDateTime;
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
        private final VerificationTokenRepository tokenRepo;

        /* ================= REGISTER ================= */

        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
                authService.register(request);
                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Verification Link Sent to "+request.email(), null));
        }

        @GetMapping("/verify")
        public void verify(
                        @RequestParam String token,
                        HttpServletResponse response) throws IOException {

                VerificationToken vt = tokenRepo.findByToken(token)
                                .orElseThrow(() -> new AppException.BadRequestException("Invalid token"));

                if (vt.isUsed() || vt.getExpiryTime().isBefore(LocalDateTime.now())) {
                        response.sendRedirect("http://localhost:4200/login?verified=false");
                        return;
                }

                User user = vt.getUser();
                user.setVerified(true);
                userRepo.save(user);

                vt.setUsed(true);
                tokenRepo.save(vt);

                // ✅ Redirect to frontend login page
                response.sendRedirect("http://localhost:4200/login?verified=true");
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
                                new ApiResponse<>(true, "OTP sent successfully", null));
        }

        /* ================= VERIFY OTP ================= */

        @PostMapping("/verify-otp")
        public ResponseEntity<?> verifyOtp(
                        @RequestBody VerifyOtpRequest request) {

                String token = passwordResetService.verifyOtp(
                                request.getEmail(),
                                request.getOtp());

                return ResponseEntity.ok(
                                Map.of(
                                                "message", "OTP verified successfully",
                                                "token", token));
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
                                .orElseThrow(() -> new UnauthorizedException("Unauthorized request"));

                // 3️⃣ Update password
                user.setPassword(encoder.encode(request.password()));
                userRepo.save(user);

                // 4️⃣ Invalidate JWT reset token
                passwordResetTokenService.invalidate(request.token());

                return ResponseEntity.ok(
                                new ApiResponse<>(true, "Password reset successful", null));
        }
}
