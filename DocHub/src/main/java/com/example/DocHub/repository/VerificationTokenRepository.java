package com.example.DocHub.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.DocHub.entity.VerificationToken;

public interface VerificationTokenRepository
        extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByToken(String token);
}
