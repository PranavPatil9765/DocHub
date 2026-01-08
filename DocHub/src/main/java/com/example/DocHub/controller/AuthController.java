package com.example.DocHub.controller;

import com.example.DocHub.dto.AuthResponse;
import com.example.DocHub.dto.ForgotPasswordRequest;
import com.example.DocHub.dto.LoginRequest;
import com.example.DocHub.dto.RegisterRequest;
import com.example.DocHub.service.AuthService;
import com.example.DocHub.service.PasswordResetService;

import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    @Autowired
    private PasswordResetService passwordResetService;

    

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
           authService.register(request);
        return ResponseEntity.ok(Map.of(
    "status", "success",
    "message", "User registered successfully!"
));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        System.out.println("🔐 LOGIN endpoint reached!");
        return ResponseEntity.ok(authService.login(request));
    }

     @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody ForgotPasswordRequest request) {
        System.out.println("🔐 send otp endpoint reached!");
        
        passwordResetService.sendOtp(request.getEmail());
        return ResponseEntity.ok(
                Map.of("message", "OTP sent if email exists")
        );
    }


    @PostMapping("/verify-otp")
public ResponseEntity<?> verifyOtp(
        @RequestBody com.example.DocHub.dto.VerifyOtpRequest request) {

    passwordResetService.verifyOtp(
            request.getEmail(),
            request.getOtp()
    );

    return ResponseEntity.ok(
            Map.of("message", "OTP verified successfully")
    );
}

}
