package com.example.DocHub.controller;

import com.example.DocHub.dto.AuthResponse;
import com.example.DocHub.dto.LoginRequest;
import com.example.DocHub.dto.RegisterRequest;
import com.example.DocHub.service.AuthService;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    

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
}
