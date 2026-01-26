package com.example.DocHub.service;

import com.example.DocHub.dto.*;
import com.example.DocHub.entity.User;
import com.example.DocHub.entity.VerificationToken;
import com.example.DocHub.exception.AppException;
import com.example.DocHub.exception.AppException.BadRequestException;
import com.example.DocHub.repository.UserRepository;
import com.example.DocHub.repository.VerificationTokenRepository;
import com.example.DocHub.security.JwtService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final VerificationTokenRepository tokenRepo;
    private final EmailService emailService;
    @Transactional
public void register(RegisterRequest req) {

    if (repo.existsByEmail(req.email())) {
        throw new BadRequestException("Email already exists");
    }

    User user = User.builder()
            .email(req.email())
            .password(encoder.encode(req.password()))
            .fullName(req.fullName())
            .storageUsedBytes(0L)
            .isVerified(false)
            .build();

    repo.save(user);

    VerificationToken token = new VerificationToken(user);
    tokenRepo.save(token);

    emailService.sendVerificationEmail(user.getEmail(), token.getToken());
}



    public AuthResponse login(LoginRequest req) {

        System.out.println("🧪 Login attempt for: " + req.email());

        User user = repo.findByEmail(req.email())
                .orElseThrow(() -> new AppException.UnauthorizedException("Invalid email or password"));
        if (!user.isVerified()) {
            throw new AppException.BadRequestException("Please verify your email first");
        }

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new AppException.UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        System.out.println("✔ Login successful");

        return new AuthResponse(token);
    }

    public void oauthUserLogin(String name, String email) {

        if (!repo.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .password("OATH_PASS")
                    .fullName(name)
                    .storageUsedBytes(0L)
                    .isVerified(true)
                    .build();

            repo.save(user);
        }
    }

}
