package com.example.DocHub.service;

import com.example.DocHub.dto.*;
import com.example.DocHub.entity.User;
import com.example.DocHub.repository.UserRepository;
import com.example.DocHub.security.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repo;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public void register(RegisterRequest req){

        if (repo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .email(req.email())
                .password(encoder.encode(req.password()))
                .fullName(req.fullName())
                .build();

        repo.save(user);
    }

    public AuthResponse login(LoginRequest req) {

        System.out.println("🧪 Login attempt for: " + req.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        String token = jwtService.generateToken(req.email());

        System.out.println("✔ Login successful. Token: " + token);

        return new AuthResponse(token);
    }
    public void oauthUserLogin(String name, String email) {

    if (!repo.existsByEmail(email)) {
         User user = User.builder()
                .email(email)
                .password("OATH_PASS")
                .fullName(name)
                .build();

        repo.save(user);
    }
}

}
